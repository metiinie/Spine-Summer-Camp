import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (status && status !== "all") where.status = status.toUpperCase();
  if (search) {
    where.OR = [
      { camper: { firstName: { contains: search } } },
      { camper: { lastName: { contains: search } } },
      { parent: { primaryName: { contains: search } } },
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
