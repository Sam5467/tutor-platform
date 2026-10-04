import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Is the site open to students yet? Admins flip this switch in /admin.
// If the setting can't be read, we treat the site as closed (tutors-only).
export const getStudentsOpen = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("students_open")
    .maybeSingle();
  return !!data?.students_open;
});
