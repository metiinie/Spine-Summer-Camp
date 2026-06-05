import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, name, camperName, referenceNumber, session } = await req.json();
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || !to) return NextResponse.json({ ok: true }); // skip if no key

    const sessionLabel = session === "HALF_DAY" ? "Session 1 – Half Day" : "Session 2 – Full Day";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Spine Summer Camp <noreply@spinecamp.com>",
        to: [to],
        subject: `Registration Received – ${referenceNumber}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #0ea5e9, #10b981); padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🌞 Spine Summer Camp</h1>
              <p style="color: #e0f2fe; margin: 8px 0 0;">Registration Received / ምዝገባ ተቀብሏል</p>
            </div>
            <p style="color: #334155;">Dear <strong>${name}</strong>,</p>
            <p style="color: #334155;">We have received your registration for <strong>${camperName}</strong>. Please complete your payment to secure your spot.</p>
            <p style="color: #64748b; font-size: 14px;">ለ<strong>${camperName}</strong> ምዝገባዎ ተቀብሏል። ቦታዎን ለማስጠበቅ ክፍያዎን ያጠናቅቁ።</p>
            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #e0f2fe;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Reference Number</p>
              <p style="margin: 0; font-size: 22px; font-weight: 700; color: #0ea5e9; font-family: monospace;">${referenceNumber}</p>
            </div>
            <p style="color: #334155;"><strong>Session:</strong> ${sessionLabel}</p>
            <p style="color: #334155;"><strong>Payment:</strong> Transfer via CBE Birr to Account: <strong>1000123456789</strong> (Spine Summer Camp)</p>
            <p style="color: #334155;">After paying, upload your receipt at our website to complete enrollment.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Spine Summer Camp · Addis Ababa, Ethiopia</p>
          </div>
        `,
      }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // fail silently
  }
}
