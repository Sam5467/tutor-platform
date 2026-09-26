import { createClient } from "@/lib/supabase/server";
import { HeaderShell } from "@/components/header-shell";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HeaderShell isLoggedIn={!!user} />;
}
