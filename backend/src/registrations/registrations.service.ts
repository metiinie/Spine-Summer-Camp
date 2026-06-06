import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { customAlphabet } from 'nanoid';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async create(body: any) {
    const { camper, parent, session, medical, waiver } = body;
    // Session pricing logic
    const amount = session.session === 'HALF_DAY' ? 26000 : 40000;
    
    // Generate Ref
    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);
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
            age: camper.age,
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
        ...(waiver && {
          waiver: {
            create: {
              liabilityRelease: waiver.liabilityRelease === true || waiver.liabilityRelease === 'true',
              mediaRelease: waiver.mediaRelease === true || waiver.mediaRelease === 'true',
              parentSignature: waiver.parentSignature,
              dateSigned: waiver.dateSigned ? new Date(waiver.dateSigned) : new Date(),
            },
          },
        }),
      },
    });

    // TODO: Trigger Email Service here

    return { id: registration.id, referenceNumber };
  }

  async findOne(id: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { id },
      include: { camper: true },
    });
    if (!reg) throw new NotFoundException();
    return reg;
  }

  async checkStatus(q: string) {
    if (!q) throw new BadRequestException();
    const isRef = q.toUpperCase().startsWith("SCAMP-");
    
    const registration = await this.prisma.registration.findFirst({
      where: isRef
        ? { referenceNumber: q.toUpperCase() }
        : { parent: { primaryEmail: { equals: q } } },
      include: { camper: true },
    });

    if (!registration) throw new NotFoundException();

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

  async findAll(status?: string, search?: string) {
    const where: any = {};
    if (status && status !== "all") where.status = status.toUpperCase();
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
      include: { camper: true, parent: true, medicalInfo: true, waiver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveOrReject(registrationId: string, action: string, rejectionReason?: string) {
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const reg = await this.prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: newStatus,
        ...(action === 'reject' && { rejectionReason }),
      },
      include: { parent: true, camper: true },
    });

    // TODO: Trigger Email

    return { success: true, status: newStatus };
  }

  async saveNote(registrationId: string, adminNote: string) {
    await this.prisma.registration.update({
      where: { id: registrationId },
      data: { adminNote },
    });
    return { success: true };
  }

  async generateCsv() {
    const registrations = await this.prisma.registration.findMany({
      include: { camper: true, parent: true, medicalInfo: true, waiver: true },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Reference", "Status", "Session", "Amount",
      "Camper First Name", "Camper Last Name", "DOB", "Gender", "Grade", "School", "T-Shirt",
      "Parent Name", "Relationship", "Phone", "Email",
      "Sub-City", "District", "House No.",
      "Allergies", "Conditions", "Dietary",
      "Liability Release", "Media Release", "Parent Signature",
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
      r.waiver?.liabilityRelease ? "Yes" : "No", r.waiver?.mediaRelease ? "Yes" : "No", r.waiver?.parentSignature || "",
      r.createdAt.toISOString(),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  }
}
