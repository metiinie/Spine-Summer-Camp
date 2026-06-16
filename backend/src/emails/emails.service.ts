import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EmailsService {
  private resend: Resend;

  private readonly logger = new Logger(EmailsService.name);
  constructor(private readonly prisma: PrismaService) {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  }

  /**
   * Process pending EmailOutbox records.
   * Uses optimistic locking via status field to avoid duplicate sends.
   */
  @Cron('*/30 * * * * *') // every 30 seconds
  async processOutbox() {
    const pending = await this.prisma.emailOutbox.findMany({
      where: { status: 'PENDING' },
      take: 20,
    });
    for (const outbox of pending) {
      try {
        // Attempt to claim the record
        const claimed = await this.prisma.emailOutbox.updateMany({
          where: {
            id: outbox.id,
            status: 'PENDING',
          },
          data: { status: 'PROCESSING' },
        });
        if (claimed.count === 0) continue; // someone else claimed
        // Send email based on type and payload
        const { type } = outbox;
      const payload = outbox.payload as any;
        // Dynamically call appropriate method
        switch (type) {
          case 'REGISTRATION_RECEIVED':
            await this.sendRegistrationReceived(
              payload.to,
              payload.name,
              payload.camperName,
              payload.referenceNumber,
              payload.session,
            );
            break;
          case 'RECEIPT_RECEIVED':
            await this.sendReceiptReceived(
              payload.to,
              payload.name,
              payload.referenceNumber,
            );
            break;
          case 'APPROVED':
            await this.sendApproved(
              payload.to,
              payload.name,
              payload.camperName,
              payload.referenceNumber,
            );
            break;
          case 'REJECTED':
            await this.sendRejected(
              payload.to,
              payload.name,
              payload.camperName,
              payload.referenceNumber,
              payload.reason,
            );
            break;
          default:
            this.logger.warn(`Unknown email type ${type}`);
        }
        await this.prisma.emailOutbox.update({
          where: { id: outbox.id },
          data: { status: 'SENT' },
        });
      } catch (e) {
        this.logger.error(`Failed to process email ${outbox.id}: ${e}`);
        await this.prisma.emailOutbox.update({
          where: { id: outbox.id },
          data: { status: 'FAILED', error: e instanceof Error ? e.message : String(e) },
        });
      }
    }
  }



  async sendRegistrationReceived(to: string, name: string, camperName: string, referenceNumber: string, session: string) {
    if (!process.env.RESEND_API_KEY) return;
    const sessionLabel = session === "HALF_DAY" ? "Session 1 – Half Day" : "Session 2 – Full Day";
    const { error } = await this.resend.emails.send({
      from: "Spine Summer Camp <onboarding@resend.dev>",
      to: [to],
      subject: `Registration Received – ${referenceNumber}`,
      html: `<p>Dear ${name}, registration for ${camperName} received.</p>`, // Simplified for brevity
    });
    if (error) throw new Error(error.message);
  }

  async sendReceiptReceived(to: string, name: string, referenceNumber: string) {
    if (!process.env.RESEND_API_KEY) return;
    const { error } = await this.resend.emails.send({
      from: "Spine Summer Camp <onboarding@resend.dev>",
      to: [to],
      subject: `Receipt Received – ${referenceNumber}`,
      html: `<p>Dear ${name}, receipt for ${referenceNumber} received. Under review.</p>`,
    });
    if (error) throw new Error(error.message);
  }

  async sendApproved(to: string, name: string, camperName: string, referenceNumber: string) {
    if (!process.env.RESEND_API_KEY) return;
    const { error } = await this.resend.emails.send({
      from: "Spine Summer Camp <onboarding@resend.dev>",
      to: [to],
      subject: `🎉 Registration Approved – ${camperName}`,
      html: `<p>Dear ${name}, ${camperName}'s registration (${referenceNumber}) is APPROVED.</p>`,
    });
    if (error) throw new Error(error.message);
  }

  async sendRejected(to: string, name: string, camperName: string, referenceNumber: string, reason?: string) {
    if (!process.env.RESEND_API_KEY) return;
    const { error } = await this.resend.emails.send({
      from: "Spine Summer Camp <onboarding@resend.dev>",
      to: [to],
      subject: `Registration Update – ${camperName}`,
      html: `<p>Dear ${name}, ${camperName}'s registration (${referenceNumber}) was NOT approved.</p><p>Reason: ${reason}</p>`,
    });
    if (error) throw new Error(error.message);
  }
}
