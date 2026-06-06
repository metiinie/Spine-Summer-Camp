import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET() {
  const session = await auth();
  if (!session?.user || !(["ADMIN", "STAFF"] as string[]).includes((session.user as { role?: string }).role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND}/admin/export`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${(session as { accessToken?: string }).accessToken ?? ""}`,
      },
    });

    const csv = await res.text();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="registrations-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend" }, { status: 502 });
  }
}
