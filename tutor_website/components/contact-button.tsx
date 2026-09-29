"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ContactButtonProps = {
  tutorId: string;
  phone: string;
};

export function ContactButton({ tutorId, phone }: ContactButtonProps) {
  const [contacted, setContacted] = useState(false);
  const [checking, setChecking] = useState(true);

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
    if (contacted) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("contact_requests").insert({
      student_id: user.id,
      tutor_id: tutorId,
    });

    if (!error) {
      setContacted(true);
    }
  };

  return (
    <div className="flex flex-col gap-3 border border-stone rounded-lg p-4">
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleContact}
        className="rounded-full bg-brass text-paper text-center px-6 py-3 text-sm font-medium"
      >
        Contact on WhatsApp
      </a>
      {!checking && contacted && (
        <p className="text-xs text-slate">
          Feel free to leave a review once your session is done!
        </p>
      )}
    </div>
  );
}
