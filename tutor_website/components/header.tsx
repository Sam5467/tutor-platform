import { createClient } from "@/lib/supabase/server";
import { HeaderShell } from "@/components/header-shell";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isApprovedTutor = false;
  let userName: string | null = null;

  if (user) {
    const [{ data: tutor }, { data: student }] = await Promise.all([
      supabase
        .from("tutors")
        .select("status")
        .eq("student_id", user.id)
        .maybeSingle(),
      supabase.from("students").select("full_name").eq("id", user.id).single(),
    ]);
    isApprovedTutor = tutor?.status === "approved";
    userName = student?.full_name || null;
  }

  return (
    <HeaderShell
      isLoggedIn={!!user}
      isApprovedTutor={isApprovedTutor}
      userName={userName}
    />
  );
}
