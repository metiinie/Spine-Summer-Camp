import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const registrationId = formData.get("registrationId") as string;

    if (!file || !registrationId) {
      return NextResponse.json({ error: "Missing file or registrationId" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. JPG, PNG, or PDF only." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();
    const filename = `receipt-${registrationId}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(join(uploadDir, filename), buffer);
    const receiptUrl = `/uploads/${filename}`;

    await prisma.registration.update({
      where: { id: registrationId },
      data: { receiptUrl, status: "RECEIPT_UPLOADED" },
    });

    // Send receipt-received email (non-blocking)
    try {
      const reg = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: { parent: true },
      });
      if (reg?.parent) {
        await fetch(`${process.env.NEXTAUTH_URL}/api/emails/receipt-received`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: reg.parent.primaryEmail,
            name: reg.parent.primaryName,
            referenceNumber: reg.referenceNumber,
          }),
        });
      }
    } catch {}

    return NextResponse.json({ receiptUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
