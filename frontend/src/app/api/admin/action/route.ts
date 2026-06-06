import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Spine Summer Camp <noreply@spinecamp.com>", to: [to], subject, html }),
    });
  } catch {}
}

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

    // Send email notification directly via Resend (no self-referencing fetch)
    if (res.ok) {
      try {
        const regRes = await fetch(`${BACKEND}/registrations/${body.registrationId}`, { cache: "no-store" });
        if (regRes.ok) {
          const reg = await regRes.json();
          const to = reg.parent?.primaryEmail;
          const name = reg.parent?.primaryName || "Parent";
          const camperName = `${reg.camper?.firstName || ""} ${reg.camper?.lastName || ""}`.trim();
          const referenceNumber = reg.referenceNumber;

          if (body.action === "approve") {
            await sendEmail(to, `🎉 Registration Approved – ${camperName}`, `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f0fdf4; padding: 32px; border-radius: 16px;">
                <div style="background: linear-gradient(135deg, #10b981, #0ea5e9); padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Registration Approved!</h1>
                  <p style="color: #d1fae5; margin: 8px 0 0;">ምዝገባ ፈቅዷል!</p>
                </div>
                <p style="color: #334155;">Dear <strong>${name}</strong>,</p>
                <p style="color: #334155;">Great news! <strong>${camperName}</strong>'s registration for Spine Summer Camp 2026 has been <strong style="color: #10b981;">APPROVED</strong>!</p>
                <p style="color: #64748b; font-size: 14px;">ጥሩ ዜና! የ<strong>${camperName}</strong> ምዝገባ ለ2026 ቀለም ክረምት ካምፕ <strong>ፈቅዷል</strong>!</p>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <p style="margin: 0 0 4px; color: #64748b; font-size: 14px;">Reference</p>
                  <p style="margin: 0; font-family: monospace; font-size: 18px; font-weight: 700; color: #0ea5e9;">${referenceNumber}</p>
                </div>
                <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #065f46; margin: 0 0 8px;">📅 Camp Details</h3>
                  <p style="color: #047857; margin: 4px 0;">Start Date: July 8, 2026 / ሐምሌ 1, 2026</p>
                  <p style="color: #047857; margin: 4px 0;">End Date: August 22, 2026 / ነሐሴ 16, 2026</p>
                  <p style="color: #047857; margin: 4px 0;">Location: Addis Ababa (details to follow)</p>
                </div>
                <p style="color: #334155;">Welcome to the Spine family! We can't wait to see your child this summer.</p>
                <hr style="border: none; border-top: 1px solid #d1fae5; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Spine Summer Camp · Addis Ababa, Ethiopia</p>
              </div>
            `);
          } else {
            const rejectionReason = body.rejectionReason || "";
            await sendEmail(to, `Registration Update – ${camperName} (${referenceNumber})`, `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fef2f2; padding: 32px; border-radius: 16px;">
                <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                  <h1 style="color: white; margin: 0; font-size: 22px;">Registration Update</h1>
                </div>
                <p style="color: #334155;">Dear <strong>${name}</strong>,</p>
                <p style="color: #334155;">Unfortunately, <strong>${camperName}</strong>'s registration (${referenceNumber}) was not approved at this time.</p>
                <p style="color: #64748b; font-size: 14px;">አሳዛኝ ሆኖ፣ የ<strong>${camperName}</strong> ምዝገባ (${referenceNumber}) አሁን አልፈቀደም።</p>
                ${rejectionReason ? `
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <p style="margin: 0 0 4px; color: #64748b; font-size: 14px; font-weight: 600;">Reason / ምክንያት</p>
                  <p style="margin: 0; color: #334155;">${rejectionReason}</p>
                </div>` : ""}
                <p style="color: #334155;">If you believe this is an error, please contact us or re-apply.</p>
                <hr style="border: none; border-top: 1px solid #fecaca; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Spine Summer Camp · Addis Ababa, Ethiopia</p>
              </div>
            `);
          }
        }
      } catch {}
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Admin action proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
