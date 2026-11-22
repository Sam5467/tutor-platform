import { createClient } from "@/lib/supabase/client";

// Counts a click for the admin (no name saved). Not counted on your computer.
export function logClick(kind: "find_tutor", source: "hero" | "header") {
  if (process.env.NODE_ENV === "development") return;
  createClient()
    .rpc("log_click", { p_kind: kind, p_source: source })
    .then(({ error }) => {
      if (error) console.error("Click log error:", error);
    });
}
