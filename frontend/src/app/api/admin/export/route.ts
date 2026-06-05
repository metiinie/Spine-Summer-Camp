import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registrations = await prisma.registration.findMany({
    include: { camper: true, parent: true, medicalInfo: true },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Reference", "Status", "Session", "Amount",
    "Camper First Name", "Camper Last Name", "DOB", "Gender", "Grade", "School", "T-Shirt",
    "Parent Name", "Relationship", "Phone", "Email",
    "Sub-City", "District", "House No.",
    "Allergies", "Conditions", "Dietary",
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
    r.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="registrations-${Date.now()}.csv"`,
    },
  });
}
