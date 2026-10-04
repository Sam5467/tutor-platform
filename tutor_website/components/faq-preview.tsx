"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is it free for students?",
    answer:
      "Yes. Browsing and contacting tutors is completely free for students — no fees, no commission.",
  },
  {
    question: "How do I pay my tutor?",
    answer:
      "You and your tutor arrange payment directly. Passalong isn't involved in the payment.",
  },
  {
    question: "How are tutors verified?",
    answer:
      "Every tutor listing is manually reviewed, including GPA and transcript verification, before it goes live.",
  },
  {
    question: "Can I become a tutor?",
    answer:
      "If you're a senior student who has already passed the course, yes — submit your info and transcript for review.",
  },
];

export function FaqPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="font-display text-3xl md:text-4xl text-ink mb-12 max-w-md">
        FAQ
      </h2>
      <div className="flex flex-col">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question} className="hairline-divider py-6">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="font-display text-lg text-ink">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-slate transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="text-slate leading-relaxed mt-3">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
