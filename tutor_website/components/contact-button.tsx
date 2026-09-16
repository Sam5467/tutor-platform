"use client";

import { useState } from "react";

type ContactButtonProps = {
  tutorId: string;
  phone: string;
};

export function ContactButton({ tutorId, phone }: ContactButtonProps) {
  const [contacted, setContacted] = useState(false);

  const handleContact = () => {
    // TODO: replace with real contact-request tracking (DB write) once backend exists.
    // This is what makes the student eligible to leave a review later.
    console.log(`Contact request sent: tutorId=${tutorId}`);
    setContacted(true);
  };

  return (
    <div className="flex flex-col gap-3 border border-stone rounded-lg p-4">
      <p className="text-sm text-slate">Phone / WhatsApp</p>
      <p className="text-ink font-medium">+{phone}</p>
      
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleContact}
        className="rounded-full bg-brass text-paper text-center px-6 py-3 text-sm font-medium"
      >
        Contact on WhatsApp
      </a>
      {contacted && (
        <p className="text-xs text-slate">Contact request recorded.</p>
      )}
    </div>
  );
}
