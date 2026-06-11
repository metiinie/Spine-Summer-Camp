import { Request, Response } from 'express';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { AdminActionDto, AdminNoteDto } from './dto/admin-action.dto';
export declare class RegistrationsController {
    private readonly regService;
    constructor(regService: RegistrationsService);
    createRegistration(body: CreateRegistrationDto): Promise<{
        id: string;
        referenceNumber: string;
    }>;
    checkStatus(query: string): Promise<{
        referenceNumber: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        session: import(".prisma/client").$Enums.SessionType;
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
            registrationId: string;
            firstName: string;
            lastName: string;
            age: number;
            gender: import(".prisma/client").$Enums.Gender;
            gradeLevel: string;
            schoolName: string;
            tShirtSize: import(".prisma/client").$Enums.TShirtSize;
            height: number | null;
            weight: number | null;
        } | null;
        parent: {
            id: string;
            registrationId: string;
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
        } | null;
        medicalInfo: {
            id: string;
            registrationId: string;
            allergies: string | null;
            conditions: string | null;
            dietary: string | null;
        } | null;
        waiver: {
            id: string;
            registrationId: string;
            liabilityRelease: boolean;
            mediaRelease: boolean;
            parentSignature: string;
            dateSigned: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        session: import(".prisma/client").$Enums.SessionType;
        idempotencyKey: string | null;
        referenceNumber: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        receiptUrl: string | null;
        adminNote: string | null;
        rejectionReason: string | null;
        campYear: number;
        deletedAt: Date | null;
    }>;
    getRegistrations(query: FindAllQueryDto): Promise<{
        data: ({
            camper: {
                id: string;
                registrationId: string;
                firstName: string;
                lastName: string;
                age: number;
                gender: import(".prisma/client").$Enums.Gender;
                gradeLevel: string;
                schoolName: string;
                tShirtSize: import(".prisma/client").$Enums.TShirtSize;
                height: number | null;
                weight: number | null;
            } | null;
            parent: {
                id: string;
                registrationId: string;
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
            } | null;
            medicalInfo: {
                id: string;
                registrationId: string;
                allergies: string | null;
                conditions: string | null;
                dietary: string | null;
            } | null;
            waiver: {
                id: string;
                registrationId: string;
                liabilityRelease: boolean;
                mediaRelease: boolean;
                parentSignature: string;
                dateSigned: Date;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            session: import(".prisma/client").$Enums.SessionType;
            idempotencyKey: string | null;
            referenceNumber: string;
            status: import(".prisma/client").$Enums.RegistrationStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            receiptUrl: string | null;
            adminNote: string | null;
            rejectionReason: string | null;
            campYear: number;
            deletedAt: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveOrReject(body: AdminActionDto, req: Request): Promise<{
        success: boolean;
        status: string;
    }>;
    saveAdminNote(body: AdminNoteDto, req: Request): Promise<{
        success: boolean;
    }>;
    exportCsv(res: Response, req: Request): Promise<void>;
}
