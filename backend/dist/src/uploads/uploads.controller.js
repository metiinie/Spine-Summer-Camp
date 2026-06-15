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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const prisma_service_1 = require("../prisma.service");
const audit_service_1 = require("../common/audit/audit.service");
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
const MAX_ID_LENGTH = 64;
const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
let UploadsController = class UploadsController {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async uploadFile(file, rawRegistrationId, rawReferenceNumber) {
        const registrationId = rawRegistrationId?.trim();
        const referenceNumber = rawReferenceNumber?.trim().toUpperCase();
        if (!file || !registrationId || !referenceNumber) {
            if (file?.path)
                await (0, promises_1.unlink)(file.path).catch(() => undefined);
            throw new common_1.BadRequestException('Missing file, registration ID, or reference number');
        }
        if (registrationId.length > MAX_ID_LENGTH ||
            !ID_PATTERN.test(registrationId)) {
            await (0, promises_1.unlink)(file.path).catch(() => undefined);
            throw new common_1.BadRequestException('Invalid registration ID format');
        }
        if (referenceNumber.length > 30 ||
            !referenceNumber.startsWith('SCAMP-')) {
            await (0, promises_1.unlink)(file.path).catch(() => undefined);
            throw new common_1.BadRequestException('Invalid reference number format');
        }
        const appUrl = process.env.APP_URL || 'http://localhost:4000';
        const receiptUrl = `${appUrl}/uploads/${file.filename}`;
        const updated = await this.prisma.registration.updateMany({
            where: {
                id: registrationId,
                referenceNumber,
                status: 'PENDING_PAYMENT',
                deletedAt: null,
            },
            data: { receiptUrl, status: 'UNDER_REVIEW' },
        });
        if (updated.count === 0) {
            await (0, promises_1.unlink)(file.path).catch(() => undefined);
            throw new common_1.ConflictException('Registration not found, already has a receipt, or reference number does not match');
        }
        const reg = await this.prisma.registration.findUniqueOrThrow({
            where: { id: registrationId },
            include: { parent: true },
        });
        await this.audit.log({
            action: 'RECEIPT_UPLOADED',
            performedBy: null,
            registrationId,
        });
        if (reg.parent?.primaryEmail) {
            const uniqueKey = `receipt-received:${registrationId}`;
            await this.prisma.emailOutbox.upsert({
                where: { uniqueKey },
                create: {
                    type: 'RECEIPT_RECEIVED',
                    uniqueKey,
                    payload: {
                        to: reg.parent.primaryEmail,
                        name: reg.parent.primaryName,
                        referenceNumber: reg.referenceNumber,
                    },
                },
                update: {},
            });
        }
        return { receiptUrl };
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './public/uploads',
            filename: (_req, _file, cb) => {
                cb(null, `receipt-${(0, crypto_1.randomUUID)()}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
                return cb(new common_1.BadRequestException('Only JPEG, PNG, WebP, and PDF files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('registrationId')),
    __param(2, (0, common_1.Body)('referenceNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadFile", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('upload-receipt'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map