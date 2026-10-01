import { createClient } from "@/lib/supabase/server";
import { HeaderShell } from "@/components/header-shell";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let approvedTutorId: string | null = null;
  let userName: string | null = null;

  if (user) {
    const [{ data: tutor }, { data: student }] = await Promise.all([
      supabase
        .from("tutors")
        .select("id, status")
        .eq("student_id", user.id)
        .maybeSingle(),
      supabase.from("students").select("full_name").eq("id", user.id).single(),
    ]);
    if (tutor?.status === "approved") {
      approvedTutorId = tutor.id;
    }
    userName = student?.full_name || null;
  }

  return (
    <HeaderShell
      isLoggedIn={!!user}
      approvedTutorId={approvedTutorId}
      userName={userName}
    />
  );
}
