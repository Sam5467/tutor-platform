"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type SpotlightTutor = {
  name: string;
  major: string;
  year: string;
  courses: string[];
  quote: string;
};

// Placeholder data - will be replaced with real tutors once we wire up the database
const spotlightTutors: SpotlightTutor[] = [
  {
    name: "Sarah K.",
    major: "Computer Science",
    year: "Senior",
    courses: ["CSC 201", "CSC 265"],
    quote: "I remember exactly which parts of this course trip people up.",
  },
  {
    name: "Elie M.",
    major: "Computer Engineering",
    year: "Senior",
    courses: ["GIN 221", "GIN 320"],
    quote: "Passed both of these with distinction last year - happy to walk through them.",
  },
];

export function TutorSpotlight() {
  const [index, setIndex] = useState(0);
  const tutor = spotlightTutors[index];

  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-slate uppercase tracking-wide text-sm mb-8">
        This week's tutors
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={tutor.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-display italic text-2xl md:text-3xl text-ink mb-6 leading-snug">
            &ldquo;{tutor.quote}&rdquo;
          </p>
          <p className="text-ink font-medium">{tutor.name}</p>
          <p className="text-slate text-sm">
            {tutor.major}, {tutor.year} - {tutor.courses.join(", ")}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2 mt-10">
        {spotlightTutors.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setIndex(i)}
            aria-label={`Show ${t.name}`}
            className={`h-1.5 w-6 rounded-full transition-colors ${
              i === index ? "bg-brass" : "bg-stone"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
