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
const prisma_service_1 = require("../prisma.service");
const nanoid_1 = require("nanoid");
let RegistrationsService = class RegistrationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(body) {
        const { camper, parent, session, medical } = body;
        const amount = session.session === 'HALF_DAY' ? 4000 : 7000;
        const nanoid = (0, nanoid_1.customAlphabet)('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);
        const referenceNumber = `SCAMP-2026-${nanoid()}`;
        const registration = await this.prisma.registration.create({
            data: {
                referenceNumber,
                status: 'PENDING_PAYMENT',
                session: session.session,
                amount,
                camper: {
                    create: {
                        firstName: camper.firstName,
                        lastName: camper.lastName,
                        dateOfBirth: new Date(camper.dateOfBirth),
                        gender: camper.gender,
                        gradeLevel: camper.gradeLevel,
                        schoolName: camper.schoolName,
                        tShirtSize: camper.tShirtSize,
                    },
                },
                parent: {
                    create: {
                        primaryName: parent.primaryName,
                        primaryRelationship: parent.primaryRelationship,
                        primaryPhone: parent.primaryPhone,
                        primaryEmail: parent.primaryEmail,
                        secondaryName: parent.secondaryName,
                        secondaryPhone: parent.secondaryPhone,
                        secondaryRelationship: parent.secondaryRelationship,
                        subCity: parent.subCity,
                        district: parent.district,
                        houseNumber: parent.houseNumber,
                    },
                },
                medicalInfo: {
                    create: {
                        allergies: medical?.allergies || null,
                        conditions: medical?.conditions || null,
                        dietary: medical?.dietary || null,
                    },
                },
            },
        });
        return { id: registration.id, referenceNumber };
    }
    async findOne(id) {
        const reg = await this.prisma.registration.findUnique({
            where: { id },
            include: { camper: true },
        });
        if (!reg)
            throw new common_1.NotFoundException();
        return reg;
    }
    async checkStatus(q) {
        if (!q)
            throw new common_1.BadRequestException();
        const isRef = q.toUpperCase().startsWith("SCAMP-");
        const registration = await this.prisma.registration.findFirst({
            where: isRef
                ? { referenceNumber: q.toUpperCase() }
                : { parent: { primaryEmail: { equals: q } } },
            include: { camper: true },
        });
        if (!registration)
            throw new common_1.NotFoundException();
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
    async findAll(status, search) {
        const where = {};
        if (status && status !== "all")
            where.status = status.toUpperCase();
        if (search) {
            where.OR = [
                { camper: { firstName: { contains: search, mode: "insensitive" } } },
                { camper: { lastName: { contains: search, mode: "insensitive" } } },
                { parent: { primaryName: { contains: search, mode: "insensitive" } } },
                { referenceNumber: { contains: search } },
            ];
        }
        return this.prisma.registration.findMany({
            where,
            include: { camper: true, parent: true, medicalInfo: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveOrReject(registrationId, action, rejectionReason) {
        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
        const reg = await this.prisma.registration.update({
            where: { id: registrationId },
            data: {
                status: newStatus,
                ...(action === 'reject' && { rejectionReason }),
            },
            include: { parent: true, camper: true },
        });
        return { success: true, status: newStatus };
    }
    async saveNote(registrationId, adminNote) {
        await this.prisma.registration.update({
            where: { id: registrationId },
            data: { adminNote },
        });
        return { success: true };
    }
    async generateCsv() {
        const registrations = await this.prisma.registration.findMany({
            include: { camper: true, parent: true, medicalInfo: true },
            orderBy: { createdAt: "desc" },
        });
        const headers = [
            "Reference", "Status", "Session", "Amount",
            "Camper First Name", "Camper Last Name", "DOB", "Gender", "Grade", "School", "T-Shirt",
            "Parent Name", "Relationship", "Phone", "Email",
            "Sub-City", "District", "House No.",
            "Allergies", "Conditions", "Dietary",
            "Submitted At"
        ];
        const rows = registrations.map((r) => [
            r.referenceNumber, r.status, r.session, r.amount.toString(),
            r.camper?.firstName || "", r.camper?.lastName || "",
            r.camper?.dateOfBirth?.toISOString().split("T")[0] || "",
            r.camper?.gender || "", r.camper?.gradeLevel || "",
            r.camper?.schoolName || "", r.camper?.tShirtSize || "",
            r.parent?.primaryName || "", r.parent?.primaryRelationship || "",
            r.parent?.primaryPhone || "", r.parent?.primaryEmail || "",
            r.parent?.subCity || "", r.parent?.district || "", r.parent?.houseNumber || "",
            r.medicalInfo?.allergies || "", r.medicalInfo?.conditions || "", r.medicalInfo?.dietary || "",
            r.createdAt.toISOString(),
        ]);
        return [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
    }
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map