import { Module } from '@nestjs/common';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { PrismaService } from '../prisma.service';
import { EmailsService } from '../emails/emails.service';
import { AuditService } from '../common/audit/audit.service';

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, PrismaService, EmailsService, AuditService],
})
export class RegistrationsModule {}
