import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    // Forward the multipart form data directly to the NestJS backend
    const formData = await req.formData();
    const res = await fetch(`${BACKEND}/upload-receipt`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
