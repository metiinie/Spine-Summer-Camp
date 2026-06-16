import { PrismaService } from '../prisma.service';
export declare class EmailsService {
    private readonly prisma;
    private resend;
    private readonly logger;
    constructor(prisma: PrismaService);
    processOutbox(): Promise<void>;
    sendRegistrationReceived(to: string, name: string, camperName: string, referenceNumber: string, session: string): Promise<void>;
    sendReceiptReceived(to: string, name: string, referenceNumber: string): Promise<void>;
    sendApproved(to: string, name: string, camperName: string, referenceNumber: string): Promise<void>;
    sendRejected(to: string, name: string, camperName: string, referenceNumber: string, reason?: string): Promise<void>;
}
