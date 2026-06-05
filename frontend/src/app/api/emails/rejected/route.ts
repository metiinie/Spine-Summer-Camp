import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, name, camperName, referenceNumber, rejectionReason } = await req.json();
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !to) return NextResponse.json({ ok: true });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Spine Summer Camp <noreply@spinecamp.com>",
        to: [to],
        subject: `Registration Update – ${camperName} (${referenceNumber})`,
        html: `
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
            <p style="color: #334155;">If you believe this is an error, please contact us or re-apply. We apologize for any inconvenience.</p>
            <p style="color: #64748b; font-size: 14px;">ስህተት ነው ብለው ካሰቡ፣ እባክዎ ያግኙን ወይም እንደገና ያስምዝገቡ።</p>
            <hr style="border: none; border-top: 1px solid #fecaca; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Spine Summer Camp · Addis Ababa, Ethiopia</p>
          </div>
        `,
      }),
    });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: true }); }
}
