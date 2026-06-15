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
            firstName: string;
            lastName: string;
            age: number;
            gender: import(".prisma/client").$Enums.Gender;
            gradeLevel: string;
            schoolName: string;
            tShirtSize: import(".prisma/client").$Enums.TShirtSize;
            height: number | null;
            weight: number | null;
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
        idempotencyKey: string | null;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        session: import(".prisma/client").$Enums.SessionType;
        amount: Prisma.Decimal;
        receiptUrl: string | null;
        adminNote: string | null;
        rejectionReason: string | null;
        campYear: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findPaymentInfo(id: string): Promise<{
        amount: string;
        id: string;
        referenceNumber: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        session: import(".prisma/client").$Enums.SessionType;
        receiptUrl: string | null;
        camper: {
            firstName: string;
            lastName: string;
        } | null;
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
                firstName: string;
                lastName: string;
                age: number;
                gender: import(".prisma/client").$Enums.Gender;
                gradeLevel: string;
                schoolName: string;
                tShirtSize: import(".prisma/client").$Enums.TShirtSize;
                height: number | null;
                weight: number | null;
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
            idempotencyKey: string | null;
            status: import(".prisma/client").$Enums.RegistrationStatus;
            session: import(".prisma/client").$Enums.SessionType;
            amount: Prisma.Decimal;
            receiptUrl: string | null;
            adminNote: string | null;
            rejectionReason: string | null;
            campYear: number;
            createdAt: Date;
            updatedAt: Date;
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
