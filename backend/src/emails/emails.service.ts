import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailsService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  }

  async sendRegistrationReceived(to: string, name: string, camperName: string, referenceNumber: string, session: string) {
    if (!process.env.RESEND_API_KEY) return;
    const sessionLabel = session === "HALF_DAY" ? "Session 1 – Half Day" : "Session 2 – Full Day";
    await this.resend.emails.send({
      from: "Spine Summer Camp <noreply@spinecamp.com>",
      to: [to],
      subject: `Registration Received – ${referenceNumber}`,
      html: `<p>Dear ${name}, registration for ${camperName} received.</p>`, // Simplified for brevity
    });
  }

  async sendReceiptReceived(to: string, name: string, referenceNumber: string) {
    if (!process.env.RESEND_API_KEY) return;
    await this.resend.emails.send({
      from: "Spine Summer Camp <noreply@spinecamp.com>",
      to: [to],
      subject: `Receipt Received – ${referenceNumber}`,
      html: `<p>Dear ${name}, receipt for ${referenceNumber} received. Under review.</p>`,
    });
  }

  async sendApproved(to: string, name: string, camperName: string, referenceNumber: string) {
    if (!process.env.RESEND_API_KEY) return;
    await this.resend.emails.send({
      from: "Spine Summer Camp <noreply@spinecamp.com>",
      to: [to],
      subject: `🎉 Registration Approved – ${camperName}`,
      html: `<p>Dear ${name}, ${camperName}'s registration (${referenceNumber}) is APPROVED.</p>`,
    });
  }

  async sendRejected(to: string, name: string, camperName: string, referenceNumber: string, reason?: string) {
    if (!process.env.RESEND_API_KEY) return;
    await this.resend.emails.send({
      from: "Spine Summer Camp <noreply@spinecamp.com>",
      to: [to],
      subject: `Registration Update – ${camperName}`,
      html: `<p>Dear ${name}, ${camperName}'s registration (${referenceNumber}) was NOT approved.</p><p>Reason: ${reason}</p>`,
    });
  }
}
