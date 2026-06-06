import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !(["ADMIN", "STAFF"] as string[]).includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/admin/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session as { accessToken?: string }).accessToken ?? ""}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    // Also send email via our own email routes (which use Resend)
    if (res.ok) {
      try {
        const emailEndpoint = body.action === "approve" ? "approved" : "rejected";
        // Fetch the registration info for the email
        const regRes = await fetch(`${BACKEND}/registrations/${body.registrationId}`, { cache: "no-store" });
        if (regRes.ok) {
          const reg = await regRes.json();
          await fetch(`${process.env.NEXTAUTH_URL}/api/emails/${emailEndpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: reg.parent?.primaryEmail,
              name: reg.parent?.primaryName,
              camperName: `${reg.camper?.firstName} ${reg.camper?.lastName}`,
              referenceNumber: reg.referenceNumber,
              rejectionReason: body.rejectionReason,
            }),
          });
        }
      } catch {}
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Admin action proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
