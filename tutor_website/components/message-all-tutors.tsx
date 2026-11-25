"use client";

import { useEffect, useState } from "react";

const SITE_URL = "https://www.passalonglb.com";
const SENT_KEY = "passalong-broadcast-sent";
const MESSAGE_KEY = "passalong-broadcast-message";

const DEFAULT_MESSAGE = `Hi {name}! Big news: Passalong is now open to students, just in time for finals 🎉

Your listing is free until 15 February 2027, so every student you get during finals costs you nothing.

A few quick things:
1. Add a profile photo if you haven't. Cards with a face get far more messages.
2. Check your courses and price are right.
3. New: you can now tick if you also help with projects or a thesis.
To do all three: www.passalonglb.com → Tutor log in → My tutor card → Edit.

4. Share your tutor card on your story and in your course groups. More students means more sessions for you.
5. After each session, send your student your review link. It's in the "Get reviews" box on your tutor card, with a button that sends it on WhatsApp in one tap.

Your card: {link}`;

type Recipient = { id: string; full_name: string; phone: string | null };

// One message written once, sent to each approved tutor in one tap: the
// WhatsApp chat opens with the message already typed, with their first name
// and their card link filled in. This browser remembers who was already sent.
export function MessageAllTutors({ tutors }: { tutors: Recipient[] }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sent, setSent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const savedSent = localStorage.getItem(SENT_KEY);
      const savedMessage = localStorage.getItem(MESSAGE_KEY);
      // Read once from this browser's storage after the page loads.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedSent) setSent(JSON.parse(savedSent));
      if (savedMessage) setMessage(savedMessage);
    } catch {
      // Storage blocked: start fresh.
    }
  }, []);

  const save = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage blocked: nothing is remembered, that's all.
    }
  };

  const updateMessage = (value: string) => {
    setMessage(value);
    save(MESSAGE_KEY, value);
  };

  const markSent = (id: string, isSent: boolean) => {
    const next = isSent
      ? [...new Set([...sent, id])]
      : sent.filter((s) => s !== id);
    setSent(next);
    save(SENT_KEY, JSON.stringify(next));
  };

  const fill = (t: Recipient) =>
    message
      .replaceAll("{name}", t.full_name.trim().split(" ")[0] || "there")
      .replaceAll("{link}", `${SITE_URL}/tutors/${t.id}`);

  const sentCount = tutors.filter((t) => sent.includes(t.id)).length;

  return (
    <div className="border border-stone rounded-lg p-5 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-ink">
            Message all tutors ({sentCount} of {tutors.length} sent)
          </h2>
          <p className="text-sm text-slate">
            Write the message once. Each WhatsApp button opens the chat with it
            already typed, with {"{name}"} and {"{link}"} filled in for that
            tutor. Just press Send.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-full border border-stone px-4 py-2 text-xs text-slate shrink-0"
        >
          {open ? "Hide" : "Open"}
        </button>
      </div>

      {open && (
        <div className="mt-5 flex flex-col gap-4">
          <textarea
            value={message}
            onChange={(e) => updateMessage(e.target.value)}
            rows={12}
            className="border border-stone rounded-lg py-2 px-3 text-ink text-sm"
          />
          <div className="flex flex-wrap gap-3 text-xs">
            <button
              type="button"
              onClick={() => updateMessage(DEFAULT_MESSAGE)}
              className="text-slate underline"
            >
              Reset the message
            </button>
            {sentCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Untick everyone, to send a new message?")) {
                    setSent([]);
                    save(SENT_KEY, "[]");
                  }
                }}
                className="text-slate underline"
              >
                Untick everyone (new message)
              </button>
            )}
          </div>

          <ul className="flex flex-col divide-y divide-stone text-sm">
            {tutors.map((t) => {
              const isSent = sent.includes(t.id);
              return (
                <li
                  key={t.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
                >
                  <div className="min-w-0">
                    <p className={isSent ? "text-slate line-through" : "text-ink"}>
                      {t.full_name}
                    </p>
                    <p className="text-xs text-slate">
                      {t.phone ? `+${t.phone}` : "No phone number"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {t.phone && (
                      <a
                        href={`https://wa.me/${t.phone}?text=${encodeURIComponent(fill(t))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => markSent(t.id, true)}
                        className={`rounded-full px-3 py-1 ${
                          isSent ? "border border-stone text-slate" : "bg-brass text-paper"
                        }`}
                      >
                        {isSent ? "Send again" : "WhatsApp"}
                      </a>
                    )}
                    {isSent && (
                      <button
                        type="button"
                        onClick={() => markSent(t.id, false)}
                        className="text-slate underline"
                      >
                        Untick
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
