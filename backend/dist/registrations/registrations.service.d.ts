import { PrismaService } from '../prisma.service';
export declare class RegistrationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(body: any): Promise<{
        id: string;
        referenceNumber: string;
    }>;
    findOne(id: string): Promise<{
        camper: {
            id: string;
            firstName: string;
            lastName: string;
            age: number;
            dateOfBirth: Date;
            gender: string;
            gradeLevel: string;
            schoolName: string;
            tShirtSize: string;
            registrationId: string;
        } | null;
    } & {
        id: string;
        referenceNumber: string;
        status: string;
        session: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        receiptUrl: string | null;
        adminNote: string | null;
        rejectionReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkStatus(q: string): Promise<{
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
    findAll(status?: string, search?: string): Promise<({
        camper: {
            id: string;
            firstName: string;
            lastName: string;
            age: number;
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
        referenceNumber: string;
        status: string;
        session: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        receiptUrl: string | null;
        adminNote: string | null;
        rejectionReason: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    approveOrReject(registrationId: string, action: string, rejectionReason?: string): Promise<{
        success: boolean;
        status: string;
    }>;
    saveNote(registrationId: string, adminNote: string): Promise<{
        success: boolean;
    }>;
    generateCsv(): Promise<string>;
}
