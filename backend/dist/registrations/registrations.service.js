"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const nanoid_1 = require("nanoid");
const audit_service_1 = require("../common/audit/audit.service");
const prisma_service_1 = require("../prisma.service");
const VALID_TRANSITIONS = {
    PENDING_PAYMENT: [client_1.RegistrationStatus.UNDER_REVIEW],
    RECEIPT_UPLOADED: [
        client_1.RegistrationStatus.UNDER_REVIEW,
        client_1.RegistrationStatus.APPROVED,
        client_1.RegistrationStatus.REJECTED,
    ],
    UNDER_REVIEW: [client_1.RegistrationStatus.APPROVED, client_1.RegistrationStatus.REJECTED],
    APPROVED: [],
    REJECTED: [],
};
const REFERENCE_NUMBER_LENGTH = 8;
const MAX_REFERENCE_ATTEMPTS = 5;
const generateReferenceSuffix = (0, nanoid_1.customAlphabet)('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', REFERENCE_NUMBER_LENGTH);
const PACKAGE_PRICES = {
    FULL_PACKAGE_FULL_DAY: 40000,
    FULL_PACKAGE_HALF_DAY: 26000,
    MIXED_PACKAGE: 24000,
    SELF_PACKAGE: 22000,
};
const PACKAGE_SESSION = {
    FULL_PACKAGE_FULL_DAY: client_1.SessionType.FULL_DAY,
    FULL_PACKAGE_HALF_DAY: client_1.SessionType.HALF_DAY,
    MIXED_PACKAGE: client_1.SessionType.HALF_DAY,
    SELF_PACKAGE: client_1.SessionType.HALF_DAY,
};
const ALL_MAIN_ACTIVITIES = [
    client_1.MainActivity.FOOTBALL,
    client_1.MainActivity.SWIMMING,
    client_1.MainActivity.CYCLING,
    client_1.MainActivity.CULTURAL_DANCE,
    client_1.MainActivity.KARATE,
];
function isPrismaError(error, code) {
    return (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === code);
}
function escapeCsvCell(value) {
    const text = String(value ?? '');
    const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
}
let RegistrationsService = class RegistrationsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(body) {
        const { camper, parent, session, medical, waiver, idempotencyKey } = body;
        const pkgType = session.packageType;
        const resolvedSession = PACKAGE_SESSION[pkgType] ?? session.session;
        const amount = PACKAGE_PRICES[pkgType] ?? (resolvedSession === client_1.SessionType.FULL_DAY ? 40000 : 26000);
        let activities;
        if (pkgType === client_1.PackageType.FULL_PACKAGE_FULL_DAY || pkgType === client_1.PackageType.FULL_PACKAGE_HALF_DAY) {
            activities = ALL_MAIN_ACTIVITIES;
        }
        else {
            activities = (session.selectedActivities ?? []).map((a) => a);
            if (pkgType === client_1.PackageType.MIXED_PACKAGE && activities.length !== 2) {
                throw new common_1.BadRequestException('Mixed package requires exactly 2 main activities');
            }
            if (pkgType === client_1.PackageType.SELF_PACKAGE && activities.length !== 1) {
                throw new common_1.BadRequestException('Self package requires exactly 1 main activity');
            }
        }
        if (idempotencyKey) {
            const existing = await this.prisma.registration.findUnique({
                where: { idempotencyKey },
            });
            if (existing) {
                return {
                    id: existing.id,
                    referenceNumber: existing.referenceNumber,
                };
            }
        }
        for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
            const referenceNumber = `SCAMP-2026-${generateReferenceSuffix()}`;
            try {
                const registration = await this.prisma.$transaction(async (tx) => {
                    const created = await tx.registration.create({
                        data: {
                            referenceNumber,
                            status: client_1.RegistrationStatus.PENDING_PAYMENT,
                            session: resolvedSession,
                            packageType: pkgType,
                            selectedActivities: activities,
                            amount,
                            idempotencyKey,
                            camper: {
                                create: {
                                    firstName: camper.firstName,
                                    lastName: camper.lastName,
                                    age: camper.age,
                                    gender: camper.gender,
                                    gradeLevel: camper.gradeLevel,
                                    schoolName: camper.schoolName,
                                    tShirtSize: camper.tShirtSize,
                                    height: camper.height ?? null,
                                    weight: camper.weight ?? null,
                                },
                            },
                            parent: {
                                create: {
                                    primaryName: parent.primaryName,
                                    primaryRelationship: parent.primaryRelationship,
                                    primaryPhone: parent.primaryPhone,
                                    primaryEmail: parent.primaryEmail,
                                    secondaryName: parent.secondaryName ?? null,
                                    secondaryPhone: parent.secondaryPhone ?? null,
                                    secondaryRelationship: parent.secondaryRelationship ?? null,
                                    subCity: parent.subCity,
                                    district: parent.district,
                                    houseNumber: parent.houseNumber ?? null,
                                },
                            },
                            medicalInfo: {
                                create: {
                                    allergies: medical?.allergies ?? null,
                                    conditions: medical?.conditions ?? null,
                                    dietary: medical?.dietary ?? null,
                                },
                            },
                            waiver: {
                                create: {
                                    liabilityRelease: waiver.liabilityRelease,
                                    mediaRelease: waiver.mediaRelease,
                                    parentSignature: waiver.parentSignature,
                                    dateSigned: waiver.dateSigned
                                        ? new Date(waiver.dateSigned)
                                        : new Date(),
                                },
                            },
                        },
                        include: { parent: true },
                    });
                    await this.enqueueEmail(tx, {
                        type: 'REGISTRATION_RECEIVED',
                        uniqueKey: `registration-received:${created.id}`,
                        payload: {
                            to: created.parent?.primaryEmail,
                            name: created.parent?.primaryName,
                            camperName: `${camper.firstName} ${camper.lastName}`,
                            referenceNumber,
                            session: session.session,
                        },
                    });
                    return created;
                }, {
                    maxWait: 5000,
                    timeout: 15000,
                });
                return {
                    id: registration.id,
                    referenceNumber: registration.referenceNumber,
                };
            }
            catch (error) {
                if (isPrismaError(error, 'P2002')) {
                    if (idempotencyKey) {
                        const existing = await this.prisma.registration.findUnique({
                            where: { idempotencyKey },
                        });
                        if (existing) {
                            return {
                                id: existing.id,
                                referenceNumber: existing.referenceNumber,
                            };
                        }
                    }
                    continue;
                }
                throw error;
            }
        }
        throw new common_1.ConflictException('Could not create registration. Please retry.');
    }
    async findOne(id) {
        const reg = await this.prisma.registration.findFirst({
            where: { id, deletedAt: null },
            include: {
                camper: true,
                parent: true,
                medicalInfo: true,
                waiver: true,
            },
        });
        if (!reg)
            throw new common_1.NotFoundException('Registration not found');
        return reg;
    }
    async findPaymentInfo(id) {
        const reg = await this.prisma.registration.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                referenceNumber: true,
                amount: true,
                session: true,
                packageType: true,
                selectedActivities: true,
                status: true,
                receiptUrl: true,
                camper: { select: { firstName: true, lastName: true } },
            },
        });
        if (!reg)
            throw new common_1.NotFoundException('Registration not found');
        return { ...reg, amount: reg.amount.toString() };
    }
    async checkStatus(q) {
        const query = q?.trim();
        if (!query)
            throw new common_1.BadRequestException('Query parameter required');
        if (query.length > 255)
            throw new common_1.BadRequestException('Query is too long');
        const isRef = query.toUpperCase().startsWith('SCAMP-');
        const registration = await this.prisma.registration.findFirst({
            where: isRef
                ? { referenceNumber: query.toUpperCase(), deletedAt: null }
                : {
                    parent: { primaryEmail: { equals: query.toLowerCase() } },
                    deletedAt: null,
                },
            include: { camper: true },
            orderBy: { createdAt: 'desc' },
        });
        if (!registration)
            throw new common_1.NotFoundException('Registration not found');
        return {
            referenceNumber: registration.referenceNumber,
            status: registration.status,
            session: registration.session,
            amount: registration.amount.toString(),
            createdAt: registration.createdAt.toISOString(),
            rejectionReason: registration.rejectionReason,
            camper: registration.camper
                ? {
                    firstName: registration.camper.firstName,
                    lastName: registration.camper.lastName,
                }
                : null,
        };
    }
    async findAll(query) {
        const { status, search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (status && status !== 'all') {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { camper: { firstName: { contains: search, mode: 'insensitive' } } },
                { camper: { lastName: { contains: search, mode: 'insensitive' } } },
                { parent: { primaryName: { contains: search, mode: 'insensitive' } } },
                { referenceNumber: { contains: search.toUpperCase() } },
            ];
        }
        const [total, data] = await this.prisma.$transaction([
            this.prisma.registration.count({ where }),
            this.prisma.registration.findMany({
                where,
                include: {
                    camper: true,
                    parent: true,
                    medicalInfo: true,
                    waiver: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async approveOrReject(dto, performedBy) {
        const existing = await this.prisma.registration.findFirst({
            where: { id: dto.registrationId, deletedAt: null },
        });
        if (!existing)
            throw new common_1.NotFoundException('Registration not found');
        const newStatus = dto.action === 'approve'
            ? client_1.RegistrationStatus.APPROVED
            : client_1.RegistrationStatus.REJECTED;
        const allowed = VALID_TRANSITIONS[existing.status] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${existing.status} to ${newStatus}`);
        }
        const reg = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.registration.updateMany({
                where: {
                    id: dto.registrationId,
                    status: existing.status,
                    deletedAt: null,
                },
                data: {
                    status: newStatus,
                    rejectionReason: dto.action === 'reject' ? dto.rejectionReason : null,
                },
            });
            if (updated.count === 0) {
                throw new common_1.ConflictException('Concurrent update - registration status changed');
            }
            const updatedRegistration = await tx.registration.findUniqueOrThrow({
                where: { id: dto.registrationId },
                include: { parent: true, camper: true },
            });
            await tx.auditLog.create({
                data: {
                    action: dto.action === 'approve'
                        ? 'REGISTRATION_APPROVED'
                        : 'REGISTRATION_REJECTED',
                    performedBy,
                    registrationId: dto.registrationId,
                    details: dto.action === 'reject'
                        ? { reason: dto.rejectionReason }
                        : undefined,
                },
            });
            if (updatedRegistration.parent?.primaryEmail && updatedRegistration.camper) {
                const camperName = `${updatedRegistration.camper.firstName} ${updatedRegistration.camper.lastName}`;
                await this.enqueueEmail(tx, {
                    type: dto.action === 'approve' ? 'APPROVED' : 'REJECTED',
                    uniqueKey: `${dto.action}:${updatedRegistration.id}:${newStatus}`,
                    payload: {
                        to: updatedRegistration.parent.primaryEmail,
                        name: updatedRegistration.parent.primaryName,
                        camperName,
                        referenceNumber: updatedRegistration.referenceNumber,
                        reason: dto.rejectionReason,
                    },
                });
            }
            return updatedRegistration;
        });
        return { success: true, status: reg.status };
    }
    async saveNote(dto, performedBy) {
        const updated = await this.prisma.registration.updateMany({
            where: { id: dto.registrationId, deletedAt: null },
            data: { adminNote: dto.adminNote },
        });
        if (updated.count === 0) {
            throw new common_1.NotFoundException('Registration not found');
        }
        await this.audit.log({
            action: 'ADMIN_NOTE_SAVED',
            performedBy,
            registrationId: dto.registrationId,
        });
        return { success: true };
    }
    async generateCsvData(performedBy) {
        const header = [
            'Reference',
            'Status',
            'Package',
            'Session',
            'Selected Activities',
            'Amount',
            'Camper First Name',
            'Camper Last Name',
            'Age',
            'Gender',
            'Grade',
            'School',
            'T-Shirt',
            'Parent Name',
            'Relationship',
            'Phone',
            'Email',
            'Sub-City',
            'District',
            'House No.',
            'Allergies',
            'Conditions',
            'Dietary',
            'Liability Release',
            'Media Release',
            'Parent Signature',
            'Submitted At',
        ];
        const rows = [header.map(escapeCsvCell).join(',')];
        let cursor;
        for (;;) {
            const regs = await this.prisma.registration.findMany({
                where: { deletedAt: null },
                include: {
                    camper: true,
                    parent: true,
                    medicalInfo: true,
                    waiver: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 500,
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            });
            if (regs.length === 0)
                break;
            rows.push(...regs.map((registration) => [
                registration.referenceNumber,
                registration.status,
                registration.packageType ?? '',
                registration.session,
                (registration.selectedActivities ?? []).join('; '),
                registration.amount.toString(),
                registration.camper?.firstName,
                registration.camper?.lastName,
                registration.camper?.age,
                registration.camper?.gender,
                registration.camper?.gradeLevel,
                registration.camper?.schoolName,
                registration.camper?.tShirtSize,
                registration.parent?.primaryName,
                registration.parent?.primaryRelationship,
                registration.parent?.primaryPhone,
                registration.parent?.primaryEmail,
                registration.parent?.subCity,
                registration.parent?.district,
                registration.parent?.houseNumber,
                registration.medicalInfo?.allergies,
                registration.medicalInfo?.conditions,
                registration.medicalInfo?.dietary,
                registration.waiver?.liabilityRelease ? 'Yes' : 'No',
                registration.waiver?.mediaRelease ? 'Yes' : 'No',
                registration.waiver?.parentSignature,
                registration.createdAt.toISOString(),
            ]
                .map(escapeCsvCell)
                .join(',')));
            cursor = regs[regs.length - 1]?.id;
        }
        await this.audit.log({ action: 'CSV_EXPORTED', performedBy });
        return rows.join('\n');
    }
    async enqueueEmail(db, params) {
        if (!params.payload.to)
            return;
        await db.emailOutbox.upsert({
            where: { uniqueKey: params.uniqueKey },
            create: {
                type: params.type,
                uniqueKey: params.uniqueKey,
                payload: params.payload,
            },
            update: {},
        });
    }
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map