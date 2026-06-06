import { PrismaService } from '../prisma.service';
import { EmailsService } from '../emails/emails.service';
export declare class UploadsController {
    private prisma;
    private emails;
    constructor(prisma: PrismaService, emails: EmailsService);
    uploadFile(file: Express.Multer.File, registrationId: string): Promise<{
        receiptUrl: string;
    }>;
}
