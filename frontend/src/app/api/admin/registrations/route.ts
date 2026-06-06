import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !(["ADMIN", "STAFF"] as string[]).includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const params = searchParams.toString();

  try {
    const res = await fetch(`${BACKEND}/admin/registrations${params ? `?${params}` : ""}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${(session as { accessToken?: string }).accessToken ?? ""}`,
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Admin registrations proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
