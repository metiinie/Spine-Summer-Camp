import { PrismaService } from '../prisma.service';
import { AuditService } from '../common/audit/audit.service';
export declare class UploadsController {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    uploadFile(file: Express.Multer.File, rawRegistrationId: string, rawReferenceNumber: string): Promise<{
        receiptUrl: string;
    }>;
}
