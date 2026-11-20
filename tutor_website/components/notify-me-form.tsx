"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizePhone } from "@/lib/phone";
import { dbErrorMessage } from "@/lib/errors";

type NotifyMeFormProps = {
  // What they searched for (a course) or the field they opened.
  course: string;
  field: string | null;
  university: string | null;
};

// Shown when a search finds no tutor: the student leaves their WhatsApp number
// and we message them when a tutor for that course joins.
export function NotifyMeForm({ course, field, university }: NotifyMeFormProps) {
  const [courseText, setCourseText] = useState(course);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanedPhone = normalizePhone(phone);
    if (!cleanedPhone) {
      setError(
        "That doesn't look like a valid number. Include your country code, e.g. 96170123456."
      );
      return;
    }

    setSending(true);
    const { error: saveError } = await createClient().rpc("request_tutor", {
      p_course: courseText,
      p_field: field,
      p_university: university,
      p_name: name,
      p_phone: cleanedPhone,
    });
    setSending(false);

    if (saveError) {
      setError(dbErrorMessage(saveError));
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto text-center rounded-lg border border-brass p-6">
        <p className="font-display text-lg text-ink mb-1">Got it!</p>
        <p className="text-sm text-slate">
          We&apos;ll message you on WhatsApp as soon as a tutor for{" "}
          <span className="text-ink">{courseText}</span> joins.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto flex flex-col gap-3 rounded-lg border border-stone p-6"
    >
      <p className="font-display text-lg text-ink">
        No tutor for this yet. Want us to find one?
      </p>
      <p className="text-sm text-slate -mt-1">
        Leave your WhatsApp number and we&apos;ll message you as soon as a tutor
        for this course joins.
      </p>
      <input
        type="text"
        required
        maxLength={100}
        value={courseText}
        onChange={(e) => setCourseText(e.target.value)}
        placeholder="Course (e.g. PHY 201, Physics 1)"
        className="border border-stone rounded-lg py-2 px-4 text-ink text-base"
      />
      <input
        type="text"
        maxLength={60}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        className="border border-stone rounded-lg py-2 px-4 text-ink text-base"
      />
      <input
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="WhatsApp number, e.g. 96170123456"
        className="border border-stone rounded-lg py-2 px-4 text-ink text-base"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="rounded-full bg-ink text-paper px-6 py-3 text-sm font-medium disabled:opacity-60"
      >
        {sending ? "Sending..." : "Notify me"}
      </button>
    </form>
  );
}
