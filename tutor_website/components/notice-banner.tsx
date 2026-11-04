"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

// Short messages shown after arriving from an email link, e.g.
// "?notice=confirmed". The notice is removed from the address once shown.
const NOTICES: Record<string, string> = {
  confirmed: "Your email is confirmed. Welcome to Passalong!",
};

export function NoticeBanner() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const key = params.get("notice");
    if (!key || !NOTICES[key]) return;
    setMessage(NOTICES[key]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", url.pathname + url.search);

    const timer = setTimeout(() => setMessage(null), 8000);
    return () => clearTimeout(timer);
  }, [params]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md flex items-center gap-3 rounded-lg bg-ink text-paper px-4 py-3 shadow-lg"
    >
      <CheckCircle2 size={20} className="text-brass shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setMessage(null)}
        aria-label="Close"
        className="text-paper/70 hover:text-paper"
      >
        <X size={18} />
      </button>
    </div>
  );
}
