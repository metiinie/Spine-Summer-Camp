import {
  Controller, Post, UseInterceptors, UploadedFile,
  Body, BadRequestException, UseGuards, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

  @UseGuards(JwtAuthGuard)
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
    @Req() req: Request,
  ) {
    if (!file || !registrationId) throw new BadRequestException('Missing file or registration ID');

    const appUrl = process.env.APP_URL || 'http://localhost:4000';
    const receiptUrl = `${appUrl}/uploads/${file.filename}`;

    const reg = await this.prisma.registration.update({
      where: { id: registrationId },
      data: { receiptUrl, status: 'RECEIPT_UPLOADED' },
      include: { parent: true },
    });

    const user = req.user as { userId: string } | undefined;
    await this.audit.log({
      action: 'RECEIPT_UPLOADED',
      performedBy: user?.userId ?? 'system',
      registrationId,
    });

    if (reg.parent?.primaryEmail) {
      await this.emails.sendReceiptReceived(
        reg.parent.primaryEmail,
        reg.parent.primaryName,
        reg.referenceNumber,
      );
    }

    return { receiptUrl };
  }
}
