import { Prisma } from '@prisma/client';
import { AuditService } from '../common/audit/audit.service';
import { PrismaService } from '../prisma.service';
import { AdminActionDto, AdminNoteDto } from './dto/admin-action.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
export declare class RegistrationsService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(body: CreateRegistrationDto): Promise<{
        id: string;
        referenceNumber: string;
    }>;
    findOne(id: string): Promise<{
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
        rejectionReason: string | null;
        adminNote: string | null;
        session: import(".prisma/client").$Enums.SessionType;
        idempotencyKey: string | null;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        referenceNumber: string;
        amount: Prisma.Decimal;
        receiptUrl: string | null;
        campYear: number;
        deletedAt: Date | null;
    }>;
    findPaymentInfo(id: string): Promise<{
        amount: string;
        camper: {
            firstName: string;
            lastName: string;
        } | null;
        id: string;
        session: import(".prisma/client").$Enums.SessionType;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        referenceNumber: string;
        receiptUrl: string | null;
    }>;
    checkStatus(q: string): Promise<{
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
    findAll(query: FindAllQueryDto): Promise<{
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
            rejectionReason: string | null;
            adminNote: string | null;
            session: import(".prisma/client").$Enums.SessionType;
            idempotencyKey: string | null;
            status: import(".prisma/client").$Enums.RegistrationStatus;
            referenceNumber: string;
            amount: Prisma.Decimal;
            receiptUrl: string | null;
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
    approveOrReject(dto: AdminActionDto, performedBy: string): Promise<{
        success: boolean;
        status: import(".prisma/client").$Enums.RegistrationStatus;
    }>;
    saveNote(dto: AdminNoteDto, performedBy: string): Promise<{
        success: boolean;
    }>;
    generateCsvData(performedBy: string): Promise<string>;
    private enqueueEmail;
}
