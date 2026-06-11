import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export type AuditAction =
  | 'REGISTRATION_APPROVED'
  | 'REGISTRATION_REJECTED'
  | 'ADMIN_NOTE_SAVED'
  | 'RECEIPT_UPLOADED'
  | 'CSV_EXPORTED';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    action: AuditAction;
    performedBy?: string | null; // user ID (null for system/public)
    registrationId?: string;
    details?: any;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: params.action,
          performedBy: params.performedBy,
          registrationId: params.registrationId ?? null,
          details: params.details ?? null,
        },
      });
    } catch (err) {
      // Audit logging must never crash the main flow
      this.logger.error('Failed to write audit log', err);
    }
  }
}
