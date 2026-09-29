import { createClient } from "@/lib/supabase/server";
import { HeaderShell } from "@/components/header-shell";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isApprovedTutor = false;

  if (user) {
    const { data } = await supabase
      .from("tutors")
      .select("status")
      .eq("student_id", user.id)
      .maybeSingle();
    isApprovedTutor = data?.status === "approved";
  }

  return <HeaderShell isLoggedIn={!!user} isApprovedTutor={isApprovedTutor} />;
}
