import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || !(["ADMIN", "STAFF"] as string[]).includes((session.user as { role?: string }).role ?? "")) {
    redirect("/admin/login");
  }
  return <AdminDashboardClient />;
}
