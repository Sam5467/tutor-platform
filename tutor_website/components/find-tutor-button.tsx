"use client";

import Link from "next/link";
import { logClick } from "@/lib/log-click";

// The home page's "Find a tutor" button, counted for the admin.
export function FindTutorButton({ className }: { className: string }) {
  return (
    <Link
      href="/tutors"
      onClick={() => logClick("find_tutor", "hero")}
      className={className}
    >
      Find a tutor
    </Link>
  );
}
