import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("====== FRONTEND PROXY PAYLOAD ======");
    console.log(JSON.stringify(body, null, 2));
    
    const res = await fetch(`${BACKEND}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    console.log(`====== BACKEND RESPONDED ${res.status} ======`);
    console.log(JSON.stringify(data, null, 2));
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Registration proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = searchParams.toString();
    const res = await fetch(`${BACKEND}/registrations${params ? `?${params}` : ""}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Registration list proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
