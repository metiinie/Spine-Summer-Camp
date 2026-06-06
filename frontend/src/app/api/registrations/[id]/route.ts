import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`${BACKEND}/registrations/${params.id}`, {
      cache: "no-store",
    });
    if (res.status === 404) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Registration fetch proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
