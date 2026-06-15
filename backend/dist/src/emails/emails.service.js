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
var EmailsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma.service");
let EmailsService = EmailsService_1 = class EmailsService {
    prisma;
    resend;
    logger = new common_1.Logger(EmailsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_placeholder');
    }
    async processOutbox() {
        const pending = await this.prisma.emailOutbox.findMany({
            where: { status: 'PENDING' },
            take: 20,
        });
        for (const outbox of pending) {
            try {
                const claimed = await this.prisma.emailOutbox.updateMany({
                    where: {
                        id: outbox.id,
                        status: 'PENDING',
                    },
                    data: { status: 'PROCESSING' },
                });
                if (claimed.count === 0)
                    continue;
                const { type } = outbox;
                const payload = outbox.payload;
                switch (type) {
                    case 'REGISTRATION_RECEIVED':
                        await this.sendRegistrationReceived(payload.to, payload.name, payload.camperName, payload.referenceNumber, payload.session);
                        break;
                    case 'RECEIPT_RECEIVED':
                        await this.sendReceiptReceived(payload.to, payload.name, payload.referenceNumber);
                        break;
                    case 'APPROVED':
                        await this.sendApproved(payload.to, payload.name, payload.camperName, payload.referenceNumber);
                        break;
                    case 'REJECTED':
                        await this.sendRejected(payload.to, payload.name, payload.camperName, payload.referenceNumber, payload.reason);
                        break;
                    default:
                        this.logger.warn(`Unknown email type ${type}`);
                }
                await this.prisma.emailOutbox.update({
                    where: { id: outbox.id },
                    data: { status: 'SENT' },
                });
            }
            catch (e) {
                this.logger.error(`Failed to process email ${outbox.id}: ${e}`);
                await this.prisma.emailOutbox.update({
                    where: { id: outbox.id },
                    data: { status: 'FAILED', error: e instanceof Error ? e.message : String(e) },
                });
            }
        }
    }
    async sendRegistrationReceived(to, name, camperName, referenceNumber, session) {
        if (!process.env.RESEND_API_KEY)
            return;
        const sessionLabel = session === "HALF_DAY" ? "Session 1 – Half Day" : "Session 2 – Full Day";
        await this.resend.emails.send({
            from: "Spine Summer Camp <noreply@spinecamp.com>",
            to: [to],
            subject: `Registration Received – ${referenceNumber}`,
            html: `<p>Dear ${name}, registration for ${camperName} received.</p>`,
        });
    }
    async sendReceiptReceived(to, name, referenceNumber) {
        if (!process.env.RESEND_API_KEY)
            return;
        await this.resend.emails.send({
            from: "Spine Summer Camp <noreply@spinecamp.com>",
            to: [to],
            subject: `Receipt Received – ${referenceNumber}`,
            html: `<p>Dear ${name}, receipt for ${referenceNumber} received. Under review.</p>`,
        });
    }
    async sendApproved(to, name, camperName, referenceNumber) {
        if (!process.env.RESEND_API_KEY)
            return;
        await this.resend.emails.send({
            from: "Spine Summer Camp <noreply@spinecamp.com>",
            to: [to],
            subject: `🎉 Registration Approved – ${camperName}`,
            html: `<p>Dear ${name}, ${camperName}'s registration (${referenceNumber}) is APPROVED.</p>`,
        });
    }
    async sendRejected(to, name, camperName, referenceNumber, reason) {
        if (!process.env.RESEND_API_KEY)
            return;
        await this.resend.emails.send({
            from: "Spine Summer Camp <noreply@spinecamp.com>",
            to: [to],
            subject: `Registration Update – ${camperName}`,
            html: `<p>Dear ${name}, ${camperName}'s registration (${referenceNumber}) was NOT approved.</p><p>Reason: ${reason}</p>`,
        });
    }
};
exports.EmailsService = EmailsService;
__decorate([
    (0, schedule_1.Cron)('*/30 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailsService.prototype, "processOutbox", null);
exports.EmailsService = EmailsService = EmailsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailsService);
//# sourceMappingURL=emails.service.js.map