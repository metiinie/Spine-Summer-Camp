import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const noteSchema = z.object({
  registrationId: z.string(),
  adminNote: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const updated = await prisma.registration.update({
    where: { id: parsed.data.registrationId },
    data: { adminNote: parsed.data.adminNote },
  });

  return NextResponse.json({ success: true });
}
