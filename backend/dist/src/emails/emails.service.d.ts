export declare class EmailsService {
    private resend;
    constructor();
    sendRegistrationReceived(to: string, name: string, camperName: string, referenceNumber: string, session: string): Promise<void>;
    sendReceiptReceived(to: string, name: string, referenceNumber: string): Promise<void>;
    sendApproved(to: string, name: string, camperName: string, referenceNumber: string): Promise<void>;
    sendRejected(to: string, name: string, camperName: string, referenceNumber: string, reason?: string): Promise<void>;
}
