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
            registrationId: string;
            firstName: string;
            lastName: string;
            age: number;
            dateOfBirth: Date;
            gender: string;
            gradeLevel: string;
            schoolName: string;
            tShirtSize: string;
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
        session: string;
        status: string;
        rejectionReason: string | null;
        adminNote: string | null;
        referenceNumber: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        receiptUrl: string | null;
    }>;
    getRegistrations(query: FindAllQueryDto): Promise<{
        data: ({
            camper: {
                id: string;
                registrationId: string;
                firstName: string;
                lastName: string;
                age: number;
                dateOfBirth: Date;
                gender: string;
                gradeLevel: string;
                schoolName: string;
                tShirtSize: string;
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
            session: string;
            status: string;
            rejectionReason: string | null;
            adminNote: string | null;
            referenceNumber: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            receiptUrl: string | null;
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
