import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const approveSchema = z.object({
  registrationId: z.string(),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = approveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { registrationId, action, rejectionReason } = parsed.data;

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";
  const registration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: newStatus,
      ...(action === "reject" && { rejectionReason }),
    },
    include: { parent: true, camper: true },
  });

  // Send email
  try {
    const emailEndpoint = action === "approve" ? "approved" : "rejected";
    await fetch(`${process.env.NEXTAUTH_URL}/api/emails/${emailEndpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: registration.parent?.primaryEmail,
        name: registration.parent?.primaryName,
        camperName: `${registration.camper?.firstName} ${registration.camper?.lastName}`,
        referenceNumber: registration.referenceNumber,
        rejectionReason,
      }),
    });
  } catch {}

  return NextResponse.json({ success: true, status: newStatus });
}
