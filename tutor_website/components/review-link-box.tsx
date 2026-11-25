"use client";

import { useState } from "react";

const SITE_URL = "https://www.passalonglb.com";

// Shown to a tutor on their own page: a link they send to students after a
// session, which opens straight on the review form.
export function ReviewLinkBox({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${SITE_URL}${path}#review`;
  const whatsappText = encodeURIComponent(
    `Thanks for the session! If it helped, could you leave me a quick review on Passalong? It takes 30 seconds: ${link}`
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your review link:", link);
    }
  };

  return (
    <div className="flex flex-col gap-3 border border-stone rounded-lg p-4">
      <p className="font-display text-ink">Get reviews</p>
      <p className="text-xs text-slate">
        After a session, send this link to your student. It opens your page
        right on the review form. Reviews bring you more students.
      </p>
      <p className="text-xs text-ink break-all bg-stone/40 rounded-md p-2">
        {link}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex-1 rounded-full border border-stone px-4 py-2 text-xs text-ink"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-brass text-paper px-4 py-2 text-xs text-center font-medium"
        >
          Send on WhatsApp
        </a>
      </div>
    </div>
  );
}
