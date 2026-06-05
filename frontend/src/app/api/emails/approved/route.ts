import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, name, camperName, referenceNumber } = await req.json();
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !to) return NextResponse.json({ ok: true });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Spine Summer Camp <noreply@spinecamp.com>",
        to: [to],
        subject: `🎉 Registration Approved – ${camperName}`,
        html: `
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
            <p style="color: #334155;">Welcome to the Spine family! We can't wait to see your child this summer. You will receive a separate email with camp location and what to bring before the camp starts.</p>
            <p style="color: #64748b; font-size: 14px;">ወደ ቀለም ቤተሰብ እንኳን ደህና መጡ! ልጅዎን ይዘን ለዚህ ክረምት እንጠብቃለን።</p>
            <hr style="border: none; border-top: 1px solid #d1fae5; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Spine Summer Camp · Addis Ababa, Ethiopia</p>
          </div>
        `,
      }),
    });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: true }); }
}
