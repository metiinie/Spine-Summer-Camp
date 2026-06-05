import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes((session.user as any).role)) {
    redirect("/admin/login");
  }
  return <AdminDashboardClient />;
}
