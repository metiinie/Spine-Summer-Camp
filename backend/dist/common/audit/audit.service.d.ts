import { PrismaService } from '../../prisma.service';
export type AuditAction = 'REGISTRATION_APPROVED' | 'REGISTRATION_REJECTED' | 'ADMIN_NOTE_SAVED' | 'RECEIPT_UPLOADED' | 'CSV_EXPORTED';
export declare class AuditService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(params: {
        action: AuditAction;
        performedBy: string;
        registrationId?: string;
        details?: string;
    }): Promise<void>;
}
