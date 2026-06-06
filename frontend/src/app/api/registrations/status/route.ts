import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q) return NextResponse.json(null);

  try {
    const res = await fetch(`${BACKEND}/registrations/status?q=${encodeURIComponent(q)}`, {
      cache: "no-store",
    });

    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Status check proxy error:", error);
    return NextResponse.json(null);
  }
}
