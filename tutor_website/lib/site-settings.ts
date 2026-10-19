import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// True only on your own computer (npm run dev), never on the live site.
// Locally: no login needed to look around, and demo tutors are added.
export const LOCAL_PREVIEW = process.env.NODE_ENV === "development";

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
