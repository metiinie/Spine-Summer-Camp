import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Gender,
  MainActivity,
  PackageType,
  Prisma,
  RegistrationStatus,
  SessionType,
  TShirtSize,
} from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { AuditService } from '../common/audit/audit.service';
import { PrismaService } from '../prisma.service';
import { AdminActionDto, AdminNoteDto } from './dto/admin-action.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { FindAllQueryDto } from './dto/find-all-query.dto';

const VALID_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  PENDING_PAYMENT: [RegistrationStatus.UNDER_REVIEW],
  RECEIPT_UPLOADED: [
    RegistrationStatus.UNDER_REVIEW,
    RegistrationStatus.APPROVED,
    RegistrationStatus.REJECTED,
  ],
  UNDER_REVIEW: [RegistrationStatus.APPROVED, RegistrationStatus.REJECTED],
  APPROVED: [],
  REJECTED: [],
};

const REFERENCE_NUMBER_LENGTH = 8;
const MAX_REFERENCE_ATTEMPTS = 5;
const generateReferenceSuffix = customAlphabet(
  '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  REFERENCE_NUMBER_LENGTH,
);

const PACKAGE_PRICES: Record<string, number> = {
  FULL_PACKAGE_FULL_DAY: 40000,
  FULL_PACKAGE_HALF_DAY: 26000,
  MIXED_PACKAGE: 24000,
  SELF_PACKAGE: 22000,
};

const PACKAGE_SESSION: Record<string, SessionType> = {
  FULL_PACKAGE_FULL_DAY: SessionType.FULL_DAY,
  FULL_PACKAGE_HALF_DAY: SessionType.HALF_DAY,
  MIXED_PACKAGE: SessionType.HALF_DAY,
  SELF_PACKAGE: SessionType.HALF_DAY,
};

const ALL_MAIN_ACTIVITIES: MainActivity[] = [
  MainActivity.FOOTBALL,
  MainActivity.SWIMMING,
  MainActivity.CYCLING,
  MainActivity.CULTURAL_DANCE,
  MainActivity.KARATE,
];

type EmailOutboxClient = Pick<Prisma.TransactionClient, 'emailOutbox'>;

function isPrismaError(error: unknown, code: string) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === code
  );
}

function escapeCsvCell(value: unknown) {
  const text = String(value ?? '');
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

@Injectable()
export class RegistrationsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(body: CreateRegistrationDto) {
    const { camper, parent, session, medical, waiver, idempotencyKey } = body;

    // Resolve package type, price, session, and activities
    const pkgType = session.packageType as PackageType;
    const resolvedSession = PACKAGE_SESSION[pkgType] ?? (session.session as SessionType);
    const amount = PACKAGE_PRICES[pkgType] ?? (resolvedSession === SessionType.FULL_DAY ? 40000 : 26000);

    // Determine selected activities based on package
    let activities: MainActivity[];
    if (pkgType === PackageType.FULL_PACKAGE_FULL_DAY || pkgType === PackageType.FULL_PACKAGE_HALF_DAY) {
      activities = ALL_MAIN_ACTIVITIES;
    } else {
      activities = (session.selectedActivities ?? []).map((a) => a as MainActivity);
      if (pkgType === PackageType.MIXED_PACKAGE && activities.length !== 2) {
        throw new BadRequestException('Mixed package requires exactly 2 main activities');
      }
      if (pkgType === PackageType.SELF_PACKAGE && activities.length !== 1) {
        throw new BadRequestException('Self package requires exactly 1 main activity');
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
              status: RegistrationStatus.PENDING_PAYMENT,
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
                  gender: camper.gender as Gender,
                  gradeLevel: camper.gradeLevel,
                  schoolName: camper.schoolName,
                  tShirtSize: camper.tShirtSize as TShirtSize,
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
      } catch (error) {
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

    throw new ConflictException('Could not create registration. Please retry.');
  }

  async findOne(id: string) {
    const reg = await this.prisma.registration.findFirst({
      where: { id, deletedAt: null },
      include: {
        camper: true,
        parent: true,
        medicalInfo: true,
        waiver: true,
      },
    });
    if (!reg) throw new NotFoundException('Registration not found');
    return reg;
  }

  async findPaymentInfo(id: string) {
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
    if (!reg) throw new NotFoundException('Registration not found');
    return { ...reg, amount: reg.amount.toString() };
  }

  async checkStatus(q: string) {
    const query = q?.trim();
    if (!query) throw new BadRequestException('Query parameter required');
    if (query.length > 255) throw new BadRequestException('Query is too long');

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
    if (!registration) throw new NotFoundException('Registration not found');
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

  async findAll(query: FindAllQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.RegistrationWhereInput = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as RegistrationStatus;
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

  async approveOrReject(dto: AdminActionDto, performedBy: string) {
    const existing = await this.prisma.registration.findFirst({
      where: { id: dto.registrationId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Registration not found');

    const newStatus =
      dto.action === 'approve'
        ? RegistrationStatus.APPROVED
        : RegistrationStatus.REJECTED;
    const allowed = VALID_TRANSITIONS[existing.status] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${existing.status} to ${newStatus}`,
      );
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
          rejectionReason:
            dto.action === 'reject' ? dto.rejectionReason : null,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          'Concurrent update - registration status changed',
        );
      }

      const updatedRegistration = await tx.registration.findUniqueOrThrow({
        where: { id: dto.registrationId },
        include: { parent: true, camper: true },
      });

      await tx.auditLog.create({
        data: {
          action:
            dto.action === 'approve'
              ? 'REGISTRATION_APPROVED'
              : 'REGISTRATION_REJECTED',
          performedBy,
          registrationId: dto.registrationId,
          details:
            dto.action === 'reject'
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

  async saveNote(dto: AdminNoteDto, performedBy: string) {
    const updated = await this.prisma.registration.updateMany({
      where: { id: dto.registrationId, deletedAt: null },
      data: { adminNote: dto.adminNote },
    });

    if (updated.count === 0) {
      throw new NotFoundException('Registration not found');
    }

    await this.audit.log({
      action: 'ADMIN_NOTE_SAVED',
      performedBy,
      registrationId: dto.registrationId,
    });

    return { success: true };
  }

  async generateCsvData(performedBy: string) {
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
    const rows: string[] = [header.map(escapeCsvCell).join(',')];
    let cursor: string | undefined;

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

      if (regs.length === 0) break;

      rows.push(
        ...regs.map((registration) =>
          [
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
            .join(','),
        ),
      );

      cursor = regs[regs.length - 1]?.id;
    }

    await this.audit.log({ action: 'CSV_EXPORTED', performedBy });
    return rows.join('\n');
  }

  private async enqueueEmail(
    db: EmailOutboxClient,
    params: { type: string; uniqueKey: string; payload: Record<string, unknown> },
  ) {
    if (!params.payload.to) return;

    await db.emailOutbox.upsert({
      where: { uniqueKey: params.uniqueKey },
      create: {
        type: params.type,
        uniqueKey: params.uniqueKey,
        payload: params.payload as Prisma.InputJsonValue,
      },
      update: {},
    });
  }
}
