import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q) return NextResponse.json(null);

  const isRef = q.toUpperCase().startsWith("SCAMP-");

  const registration = await prisma.registration.findFirst({
    where: isRef
      ? { referenceNumber: q.toUpperCase() }
      : { parent: { primaryEmail: { equals: q } } },
    include: { camper: true },
  });

  if (!registration) return NextResponse.json(null);

  return NextResponse.json({
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
  });
}
