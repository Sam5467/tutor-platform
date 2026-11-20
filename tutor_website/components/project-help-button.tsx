"use client";

import { createClient } from "@/lib/supabase/client";

// Passalong's WhatsApp for project and thesis requests (+961 76 442 596).
export const HELP_WHATSAPP = "96176442596";

const MESSAGE = `Hi Passalong! I need help with a project / thesis.
Subject / course:
University:
Deadline:`;

// Opens WhatsApp with the message already typed, and counts the press for
// the admin (without saving who pressed it).
export function ProjectHelpButton() {
  const handleClick = () => {
    if (process.env.NODE_ENV === "development") return;
    createClient()
      .rpc("log_help_click")
      .then(({ error }) => {
        if (error) console.error("Help click log error:", error);
      });
  };

  return (
    <a
      href={`https://wa.me/${HELP_WHATSAPP}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-block rounded-full bg-brass text-paper px-8 py-3 text-sm font-medium"
    >
      Message us on WhatsApp
    </a>
  );
}
