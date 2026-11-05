"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Counts one view of a tutor's profile (without saving who viewed it), so the
// admin can compare views with contacts. The same browser is counted at most
// once every 30 minutes per tutor.
const REPEAT_AFTER_MS = 30 * 60 * 1000;

export function TrackProfileView({ tutorId }: { tutorId: string }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;

    const key = `passalong-viewed-${tutorId}`;
    try {
      const last = Number(sessionStorage.getItem(key));
      if (last && Date.now() - last < REPEAT_AFTER_MS) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      // Storage blocked: count the view anyway.
    }

    createClient()
      .rpc("log_profile_view", { p_tutor_id: tutorId })
      .then(({ error }) => {
        if (error) console.error("Profile view log error:", error);
      });
  }, [tutorId]);

  return null;
}
