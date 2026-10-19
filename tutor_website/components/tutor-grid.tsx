"use client";

import { useState } from "react";
import { TutorCard } from "@/components/tutor-card";
import { universities } from "@/lib/universities";
import { modeMatches, type SessionMode } from "@/lib/session-modes";
import type { Tutor } from "@/lib/tutors";

type TutorGridProps = {
  tutors: Tutor[];
  heading: string;
  onBack?: () => void;
  backLabel?: string;
  university: string;
  mode: SessionMode | "any";
  onUniversityChange: (value: string) => void;
  onModeChange: (value: SessionMode | "any") => void;
};

const PAGE_SIZE = 12;

const selectClass =
  "w-full border border-stone rounded-lg py-2.5 px-3 text-base text-ink bg-paper";

export function TutorGrid({
  tutors,
  heading,
  onBack,
  backLabel,
  university,
  mode,
  onUniversityChange,
  onModeChange,
}: TutorGridProps) {
  const [shown, setShown] = useState(PAGE_SIZE);

  const sorted = [...tutors].sort(
    (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
  );

  // Only offer universities that have tutors here.
  const present = new Set(tutors.map((t) => t.university));
  const options = universities.filter((u) => present.has(u.short));

  // A chosen university only shows its own tutors; no one is moved to the top.
  const filtered = sorted.filter(
    (t) =>
      (university === "all" || t.university === university) &&
      modeMatches(t.sessionMode, mode)
  );

  return (
    <div className="max-w-6xl mx-auto pt-6 pb-16 px-4">
      {onBack && (
        <button onClick={onBack} className="text-slate text-sm mb-4">
          ← {backLabel}
        </button>
      )}
      <h1 className="font-display text-xl sm:text-2xl text-ink mb-4">{heading}</h1>

      <div className="grid grid-cols-2 gap-3 mb-3 max-w-md">
        <label className="text-xs text-slate">
          University
          <select
            value={university}
            onChange={(e) => {
              onUniversityChange(e.target.value);
              setShown(PAGE_SIZE);
            }}
            className={`${selectClass} mt-1`}
          >
            <option value="all">All universities</option>
            {options.map((u) => (
              <option key={u.short} value={u.short}>
                {u.short}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate">
          Sessions
          <select
            value={mode}
            onChange={(e) => {
              onModeChange(e.target.value as SessionMode | "any");
              setShown(PAGE_SIZE);
            }}
            className={`${selectClass} mt-1`}
          >
            <option value="any">Any way</option>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
          </select>
        </label>
      </div>

      <p className="text-slate text-sm mb-5">
        {filtered.length} tutor{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="text-slate text-center py-12">
          No tutors found yet. Try another university or a different search.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* Phones show a page at a time; wider screens show everyone. */}
            {filtered.map((tutor, i) => (
              <TutorCard
                key={tutor.id}
                {...tutor}
                className={i >= shown ? "hidden sm:flex" : ""}
              />
            ))}
          </div>
          {filtered.length > shown && (
            <div className="text-center mt-8 sm:hidden">
              <button
                onClick={() => setShown(shown + PAGE_SIZE)}
                className="rounded-full border border-stone px-6 py-2.5 text-sm text-ink hover:border-brass transition-colors"
              >
                Show more ({filtered.length - shown} left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
