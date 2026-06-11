import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailsService } from '../emails/emails.service';
import { AuditService } from '../common/audit/audit.service';
import { customAlphabet } from 'nanoid';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { AdminActionDto, AdminNoteDto } from './dto/admin-action.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['RECEIPT_UPLOADED'],
  RECEIPT_UPLOADED: ['UNDER_REVIEW', 'PENDING_PAYMENT'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: [],
  REJECTED: [],
};

@Injectable()
export class RegistrationsService {
  constructor(
    private prisma: PrismaService,
    private emails: EmailsService,
    private audit: AuditService,
  ) {}

  async create(body: CreateRegistrationDto) {
    const { camper, parent, session, medical, waiver, idempotencyKey } = body;

    if (idempotencyKey) {
      const existing = await this.prisma.registration.findUnique({ where: { idempotencyKey } });
      if (existing) return { id: existing.id, referenceNumber: existing.referenceNumber };
    }

    const amount = session.session === 'HALF_DAY' ? 26000 : 40000;
    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);
    const referenceNumber = `SCAMP-2026-${nanoid()}`;
    const registration = await this.prisma.$transaction(async (tx) => {
      return tx.registration.create({
        data: {
          referenceNumber, status: 'PENDING_PAYMENT' as any, session: session.session as any, amount,
          idempotencyKey,
          camper: { create: { firstName: camper.firstName, lastName: camper.lastName, age: camper.age,
            gender: camper.gender as any, gradeLevel: camper.gradeLevel,
            schoolName: camper.schoolName, tShirtSize: camper.tShirtSize as any }},
          parent: { create: { primaryName: parent.primaryName, primaryRelationship: parent.primaryRelationship,
            primaryPhone: parent.primaryPhone, primaryEmail: parent.primaryEmail,
            secondaryName: parent.secondaryName ?? null, secondaryPhone: parent.secondaryPhone ?? null,
            secondaryRelationship: parent.secondaryRelationship ?? null,
            subCity: parent.subCity, district: parent.district, houseNumber: parent.houseNumber ?? null }},
          medicalInfo: { create: { allergies: medical?.allergies ?? null, conditions: medical?.conditions ?? null, dietary: medical?.dietary ?? null }},
          ...(waiver && { waiver: { create: { liabilityRelease: waiver.liabilityRelease, mediaRelease: waiver.mediaRelease,
            parentSignature: waiver.parentSignature, dateSigned: waiver.dateSigned ? new Date(waiver.dateSigned) : new Date() }}}),
        },
        include: { parent: true },
      });
    });
    if (registration.parent?.primaryEmail) {
      await this.emails.sendRegistrationReceived(registration.parent.primaryEmail, registration.parent.primaryName,
        `${camper.firstName} ${camper.lastName}`, referenceNumber, session.session);
    }
    return { id: registration.id, referenceNumber };
  }

  async findOne(id: string) {
    const reg = await this.prisma.registration.findFirst({ where: { id, deletedAt: null }, include: { camper: true, parent: true, medicalInfo: true, waiver: true } });
    if (!reg) throw new NotFoundException('Registration not found');
    return reg;
  }

  async checkStatus(q: string) {
    if (!q || q.trim().length === 0) throw new BadRequestException('Query parameter required');
    const isRef = q.toUpperCase().startsWith('SCAMP-');
    const registration = await this.prisma.registration.findFirst({
      where: isRef ? { referenceNumber: q.toUpperCase(), deletedAt: null } : { parent: { primaryEmail: { equals: q.toLowerCase() } }, deletedAt: null },
      include: { camper: true },
    });
    if (!registration) throw new NotFoundException('Registration not found');
    return { referenceNumber: registration.referenceNumber, status: registration.status, session: registration.session,
      amount: registration.amount.toString(), createdAt: registration.createdAt.toISOString(),
      rejectionReason: registration.rejectionReason,
      camper: registration.camper ? { firstName: registration.camper.firstName, lastName: registration.camper.lastName } : null };
  }

  async findAll(query: FindAllQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (status && status !== 'all') where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { camper: { firstName: { contains: search, mode: 'insensitive' } } },
        { camper: { lastName: { contains: search, mode: 'insensitive' } } },
        { parent: { primaryName: { contains: search, mode: 'insensitive' } } },
        { referenceNumber: { contains: search } },
      ];
    }
    const [total, data] = await this.prisma.$transaction([
      this.prisma.registration.count({ where }),
      this.prisma.registration.findMany({ where, include: { camper: true, parent: true, medicalInfo: true, waiver: true }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async approveOrReject(dto: AdminActionDto, performedBy: string) {
    const existing = await this.prisma.registration.findUnique({ where: { id: dto.registrationId } });
    if (!existing) throw new NotFoundException('Registration not found');
    const newStatus = dto.action === 'approve' ? 'APPROVED' : 'REJECTED';
    const allowed = VALID_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(newStatus)) throw new BadRequestException(`Cannot transition from ${existing.status} to ${newStatus}`);
    const reg = await this.prisma.registration.update({
      where: { id: dto.registrationId },
      data: { status: newStatus as any, ...(dto.action === 'reject' && { rejectionReason: dto.rejectionReason || 'No reason provided' }) },
      include: { parent: true, camper: true },
    });
    await this.audit.log({ action: dto.action === 'approve' ? 'REGISTRATION_APPROVED' : 'REGISTRATION_REJECTED',
      performedBy, registrationId: dto.registrationId, details: dto.action === 'reject' ? { reason: dto.rejectionReason } : undefined });
    if (reg.parent?.primaryEmail && reg.camper) {
      const n = `${reg.camper.firstName} ${reg.camper.lastName}`;
      if (dto.action === 'approve') await this.emails.sendApproved(reg.parent.primaryEmail, reg.parent.primaryName, n, reg.referenceNumber);
      else await this.emails.sendRejected(reg.parent.primaryEmail, reg.parent.primaryName, n, reg.referenceNumber, dto.rejectionReason);
    }
    return { success: true, status: newStatus };
  }

  async saveNote(dto: AdminNoteDto, performedBy: string) {
    const existing = await this.prisma.registration.findUnique({ where: { id: dto.registrationId } });
    if (!existing) throw new NotFoundException('Registration not found');
    await this.prisma.registration.update({ where: { id: dto.registrationId }, data: { adminNote: dto.adminNote } });
    await this.audit.log({ action: 'ADMIN_NOTE_SAVED', performedBy, registrationId: dto.registrationId });
    return { success: true };
  }

  async generateCsvData(performedBy: string) {
    const regs = await this.prisma.registration.findMany({ where: { deletedAt: null }, include: { camper: true, parent: true, medicalInfo: true, waiver: true }, orderBy: { createdAt: 'desc' } });
    await this.audit.log({ action: 'CSV_EXPORTED', performedBy });
    const h = ['Reference','Status','Session','Amount','Camper First Name','Camper Last Name','Age','Gender','Grade','School','T-Shirt','Parent Name','Relationship','Phone','Email','Sub-City','District','House No.','Allergies','Conditions','Dietary','Liability Release','Media Release','Parent Signature','Submitted At'];
    const rows = regs.map((r) => [r.referenceNumber,r.status,r.session,r.amount.toString(),r.camper?.firstName??'',r.camper?.lastName??'',r.camper?.age?.toString()??'',r.camper?.gender??'',r.camper?.gradeLevel??'',r.camper?.schoolName??'',r.camper?.tShirtSize??'',r.parent?.primaryName??'',r.parent?.primaryRelationship??'',r.parent?.primaryPhone??'',r.parent?.primaryEmail??'',r.parent?.subCity??'',r.parent?.district??'',r.parent?.houseNumber??'',r.medicalInfo?.allergies??'',r.medicalInfo?.conditions??'',r.medicalInfo?.dietary??'',r.waiver?.liabilityRelease?'Yes':'No',r.waiver?.mediaRelease?'Yes':'No',r.waiver?.parentSignature??'',r.createdAt.toISOString()]);
    return [h,...rows].map((row)=>row.map((cell)=>`"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
  }
}