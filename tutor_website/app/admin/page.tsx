import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin-dashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: student } = await supabase
    .from("students")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!student?.is_admin) {
    redirect("/");
  }

  return <AdminDashboard />;
}
