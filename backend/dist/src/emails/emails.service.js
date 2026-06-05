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
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
let EmailsService = class EmailsService {
    resend;
    constructor() {
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_placeholder');
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
exports.EmailsService = EmailsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailsService);
//# sourceMappingURL=emails.service.js.map