import { PrismaService } from '../prisma.service';
import { EmailsService } from '../emails/emails.service';
import { AuditService } from '../common/audit/audit.service';
export declare class UploadsController {
    private prisma;
    private emails;
    private audit;
    constructor(prisma: PrismaService, emails: EmailsService, audit: AuditService);
    uploadFile(file: Express.Multer.File, registrationId: string, referenceNumber: string): Promise<{
        receiptUrl: string;
    }>;
}
