"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ContactButtonProps = {
  tutorId: string;
};

export function ContactButton({ tutorId }: ContactButtonProps) {
  const [contacted, setContacted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkExisting() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("contact_requests")
          .select("id")
          .eq("student_id", user.id)
          .eq("tutor_id", tutorId)
          .maybeSingle();
        if (data) setContacted(true);
      }
      setChecking(false);
    }

    checkExisting();
  }, [tutorId]);

  const handleContact = async () => {
    if (loading) return;
    setError("");
    setLoading(true);

    // Open the new tab right now, while we're still inside the tap, so phone
    // browsers don't block it. We point it at WhatsApp once we have the number.
    const tab = window.open("", "_blank");

    // The phone number is only handed out here, to logged-in students. This
    // also records that they contacted this tutor (needed to leave a review).
    const supabase = createClient();
    const { data: phone, error: contactError } = await supabase.rpc(
      "get_tutor_contact",
      { p_tutor_id: tutorId }
    );

    setLoading(false);

    if (contactError || !phone) {
      tab?.close();
      setError(contactError?.message ?? "Couldn't get contact details.");
      return;
    }

    setContacted(true);
    const link = `https://wa.me/${phone}`;
    if (tab) {
      tab.opener = null;
      tab.location.href = link;
    } else {
      window.location.href = link;
    }
  };

  return (
    <div className="flex flex-col gap-3 border border-stone rounded-lg p-4">
      <button
        type="button"
        onClick={handleContact}
        disabled={loading}
        className="rounded-full bg-brass text-paper text-center px-6 py-3 text-sm font-medium disabled:opacity-60"
      >
        {loading ? "Opening WhatsApp..." : "Contact on WhatsApp"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!checking && contacted && (
        <p className="text-xs text-slate">
          Feel free to leave a review once your session is done!
        </p>
      )}
    </div>
  );
}
