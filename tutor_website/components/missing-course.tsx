"use client";

import { useState } from "react";
import { NotifyMeForm } from "@/components/notify-me-form";

type MissingCourseProps = {
  field?: string | null;
  university?: string | null;
};

// "Can't find your course?" under the search bar on every browsing page.
// Opens the "notify me" form, which reaches the admin.
export function MissingCourse({
  field = null,
  university = null,
}: MissingCourseProps) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-2 text-slate text-xl leading-none z-10"
        >
          ×
        </button>
        <NotifyMeForm course="" field={field} university={university} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-3 text-sm">
      <span className="text-slate">Can&apos;t find your course?</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-brass text-paper px-4 py-2 font-medium shadow-sm hover:opacity-90 transition-opacity"
      >
        Find me a tutor
      </button>
    </div>
  );
}
