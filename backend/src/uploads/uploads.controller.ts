import {
  Controller, Post, UseInterceptors, UploadedFile,
  Body, BadRequestException, ConflictException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import { PrismaService } from '../prisma.service';
import { EmailsService } from '../emails/emails.service';
import { AuditService } from '../common/audit/audit.service';

// Only allow image and PDF receipts
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

@Controller('upload-receipt')
export class UploadsController {
  constructor(
    private prisma: PrismaService,
    private emails: EmailsService,
    private audit: AuditService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (_req, _file, cb) => {
          // UUID filename — not guessable, not based on original name
          cb(null, `receipt-${randomUUID()}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
          return cb(new BadRequestException('Only JPEG, PNG, WebP, and PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('registrationId') registrationId: string,
    @Body('referenceNumber') referenceNumber: string,
  ) {
    if (!file || !registrationId || !referenceNumber) {
      if (file?.path) await unlink(file.path).catch(() => undefined);
      throw new BadRequestException('Missing file, registration ID, or reference number');
    }

    const appUrl = process.env.APP_URL || 'http://localhost:4000';
    const receiptUrl = `${appUrl}/uploads/${file.filename}`;
    const normalizedReference = referenceNumber.trim().toUpperCase();

    const updated = await this.prisma.registration.updateMany({
      where: {
        id: registrationId,
        referenceNumber: normalizedReference,
        status: 'PENDING_PAYMENT',
        deletedAt: null,
      },
      data: { receiptUrl, status: 'UNDER_REVIEW' },
    });

    if (updated.count === 0) {
      await unlink(file.path).catch(() => undefined);
      throw new ConflictException('Registration not found, already has a receipt, or reference number does not match');
    }

    const reg = await this.prisma.registration.findUniqueOrThrow({
      where: { id: registrationId },
      include: { parent: true },
    });

    await this.audit.log({
      action: 'RECEIPT_UPLOADED',
      performedBy: null,
      registrationId,
    });

    if (reg.parent?.primaryEmail) {
        await this.prisma.emailOutbox.create({
          data: {
            type: 'RECEIPT_RECEIVED',
            payload: {
              to: reg.parent.primaryEmail,
              name: reg.parent.primaryName,
              referenceNumber: reg.referenceNumber,
            },
          },
        });
      }

    return { receiptUrl };
  }
}
