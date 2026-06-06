import { RegistrationsService } from './registrations.service';
export declare class RegistrationsController {
    private readonly regService;
    constructor(regService: RegistrationsService);
    createRegistration(body: any): Promise<{
        id: string;
        referenceNumber: string;
    }>;
    checkStatus(query: string): Promise<{
        referenceNumber: string;
        status: string;
        session: string;
        amount: string;
        createdAt: string;
        rejectionReason: string | null;
        camper: {
            firstName: string;
            lastName: string;
        } | null;
    }>;
    getRegistration(id: string): Promise<{
        camper: {
            id: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date;
            gender: string;
            gradeLevel: string;
            schoolName: string;
            tShirtSize: string;
            registrationId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        session: string;
        referenceNumber: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        receiptUrl: string | null;
        adminNote: string | null;
        rejectionReason: string | null;
    }>;
    getRegistrations(status?: string, search?: string): Promise<({
        camper: {
            id: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date;
            gender: string;
            gradeLevel: string;
            schoolName: string;
            tShirtSize: string;
            registrationId: string;
        } | null;
        parent: {
            id: string;
            primaryName: string;
            primaryRelationship: string;
            primaryPhone: string;
            primaryEmail: string;
            secondaryName: string | null;
            secondaryPhone: string | null;
            secondaryRelationship: string | null;
            subCity: string;
            district: string;
            houseNumber: string | null;
            registrationId: string;
        } | null;
        medicalInfo: {
            id: string;
            allergies: string | null;
            conditions: string | null;
            dietary: string | null;
            registrationId: string;
        } | null;
        waiver: {
            id: string;
            liabilityRelease: boolean;
            mediaRelease: boolean;
            parentSignature: string;
            dateSigned: Date;
            registrationId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        session: string;
        referenceNumber: string;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        receiptUrl: string | null;
        adminNote: string | null;
        rejectionReason: string | null;
    })[]>;
    approveOrReject(body: any): Promise<{
        success: boolean;
        status: string;
    }>;
    saveAdminNote(body: any): Promise<{
        success: boolean;
    }>;
    exportCsv(res: any): Promise<void>;
}
