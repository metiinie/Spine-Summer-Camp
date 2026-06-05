import { NextRequest, NextResponse } from "next/server";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Spine Summer Camp <noreply@spinecamp.com>", to: [to], subject, html }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { to, name, referenceNumber } = await req.json();
    await sendEmail(to, `Receipt Received – ${referenceNumber}`, `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #10b981); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 22px;">🌞 Spine Summer Camp</h1>
        </div>
        <p style="color: #334155;">Dear <strong>${name}</strong>,</p>
        <p style="color: #334155;">We have received your payment receipt for reference <strong>${referenceNumber}</strong>. Our team will review it within <strong>24 hours</strong> and send you a confirmation.</p>
        <p style="color: #64748b; font-size: 14px;">ደረሰኝዎ ተቀብሏል። ቡድናችን ውስጥ 24 ሰዓት ይገምግምዎ እና ማረጋገጫ ይላካሎዎት።</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Spine Summer Camp · Addis Ababa, Ethiopia</p>
      </div>
    `);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: true }); }
}
