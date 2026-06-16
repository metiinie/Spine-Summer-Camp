import {
  Controller, Post, UseInterceptors, UploadedFile,
  Body, BadRequestException, ConflictException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Only allow image and PDF receipts
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

// Input constraints
const MAX_ID_LENGTH = 64;
const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

@Controller('upload-receipt')
export class UploadsController {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {
    // Cloudinary reads CLOUDINARY_URL from env by default
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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
    @Body('registrationId') rawRegistrationId: string,
    @Body('referenceNumber') rawReferenceNumber: string,
  ) {
    // --- Input validation ---
    const registrationId = rawRegistrationId?.trim();
    const referenceNumber = rawReferenceNumber?.trim().toUpperCase();

    if (!file || !registrationId || !referenceNumber) {
      throw new BadRequestException('Missing file, registration ID, or reference number');
    }

    if (
      registrationId.length > MAX_ID_LENGTH ||
      !ID_PATTERN.test(registrationId)
    ) {
      throw new BadRequestException('Invalid registration ID format');
    }

    if (
      referenceNumber.length > 30 ||
      !referenceNumber.startsWith('SCAMP-')
    ) {
      throw new BadRequestException('Invalid reference number format');
    }

    // --- Business logic ---
    // Check if registration exists before attempting upload
    const existing = await this.prisma.registration.findFirst({
      where: {
        id: registrationId,
        referenceNumber,
        status: 'PENDING_PAYMENT',
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new ConflictException('Registration not found, already has a receipt, or reference number does not match');
    }

    let receiptUrl: string;
    try {
      const filename = `receipt-${randomUUID()}`;
      receiptUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'spine-summer-camp', public_id: filename, resource_type: 'auto' },
          (error, result) => {
            if (result) {
              resolve(result.secure_url);
            } else {
              reject(error);
            }
          }
        );
        Readable.from(file.buffer).pipe(uploadStream);
      });
    } catch (err) {
      throw new BadRequestException('Failed to upload file to Cloudinary. Ensure CLOUDINARY_URL is configured.');
    }

    const updated = await this.prisma.registration.updateMany({
      where: {
        id: registrationId,
        referenceNumber,
        status: 'PENDING_PAYMENT',
        deletedAt: null,
      },
      data: { receiptUrl, status: 'UNDER_REVIEW' },
    });

    if (updated.count === 0) {
      throw new ConflictException('Registration status changed during upload');
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

    // Idempotent email enqueue — upsert with uniqueKey prevents duplicate sends
    if (reg.parent?.primaryEmail) {
      const uniqueKey = `receipt-received:${registrationId}`;
      await this.prisma.emailOutbox.upsert({
        where: { uniqueKey },
        create: {
          type: 'RECEIPT_RECEIVED',
          uniqueKey,
          payload: {
            to: reg.parent.primaryEmail,
            name: reg.parent.primaryName,
            referenceNumber: reg.referenceNumber,
          },
        },
        update: {}, // Already enqueued — no-op
      });
    }

    return { receiptUrl };
  }
}
