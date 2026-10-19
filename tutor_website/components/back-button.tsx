"use client";

import { useRouter } from "next/navigation";

// Goes back to the exact page the visitor came from (e.g. the major they
// were browsing). If they opened this page directly, goes to the tutor list.
export function BackButton({ fallback, label }: { fallback: string; label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="text-slate text-sm mb-6"
    >
      ← {label}
    </button>
  );
}
