import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PrismaService } from '../prisma.service';
import { EmailsService } from '../emails/emails.service';

@Controller('upload-receipt')
export class UploadsController {
  constructor(private prisma: PrismaService, private emails: EmailsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `receipt-${Date.now()}.${ext}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('registrationId') registrationId: string) {
    if (!file || !registrationId) throw new BadRequestException('Missing file or ID');

    const appUrl = process.env.APP_URL || 'http://localhost:4000';
    const receiptUrl = `${appUrl}/uploads/${file.filename}`;

    const reg = await this.prisma.registration.update({
      where: { id: registrationId },
      data: { receiptUrl, status: 'RECEIPT_UPLOADED' },
      include: { parent: true }
    });

    if (reg.parent?.primaryEmail) {
      await this.emails.sendReceiptReceived(reg.parent.primaryEmail, reg.parent.primaryName, reg.referenceNumber);
    }

    return { receiptUrl };
  }
}
