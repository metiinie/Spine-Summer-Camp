import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/validations";
import { SESSION_CONFIG } from "@/lib/constants";
import { nanoid } from "nanoid";

function generateReference(id: string) {
  const short = nanoid(5).toUpperCase();
  return `SCAMP-2026-${short}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { camper, parent, session, medical } = parsed.data;
    const sessionConfig = SESSION_CONFIG[session.session];
    const amount = sessionConfig.price;
    const referenceNumber = generateReference(nanoid(8));

    const registration = await prisma.registration.create({
      data: {
        referenceNumber,
        status: "PENDING_PAYMENT",
        session: session.session,
        amount,
        camper: {
          create: {
            firstName: camper.firstName,
            lastName: camper.lastName,
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
      },
    });

    // Try to send confirmation email (non-blocking)
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/emails/registration-received`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: parent.primaryEmail,
          name: parent.primaryName,
          camperName: `${camper.firstName} ${camper.lastName}`,
          referenceNumber,
          session: session.session,
        }),
      });
    } catch {}

    return NextResponse.json({ id: registration.id, referenceNumber }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

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

  const registrations = await prisma.registration.findMany({
    where,
    include: { camper: true, parent: true, medicalInfo: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(registrations);
}
