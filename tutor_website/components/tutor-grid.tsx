"use client";

import { useState } from "react";
import { TutorCard } from "@/components/tutor-card";
import type { Tutor } from "@/lib/mock-data";

type TutorGridProps = {
  tutors: Tutor[];
  onBack: () => void;
};

export function TutorGrid({ tutors, onBack }: TutorGridProps) {
  const [courseQuery, setCourseQuery] = useState("");

  const approvedOnly = tutors.filter((t) => t.status === "approved");
  const sorted = [...approvedOnly].sort(
    (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
  );

  const filtered = courseQuery.trim()
    ? sorted.filter((t) =>
        t.courses.some((c) =>
          c.toLowerCase().includes(courseQuery.trim().toLowerCase())
        )
      )
    : sorted;

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <button onClick={onBack} className="text-slate text-sm mb-6">
        ← Back to majors
      </button>

      <input
        type="text"
        placeholder="Search a specific course (e.g. MATH 201)"
        value={courseQuery}
        onChange={(e) => setCourseQuery(e.target.value)}
        className="w-full border border-stone rounded-lg py-2 px-4 mb-8 text-ink"
      />

      {filtered.length === 0 ? (
        <p className="text-slate text-center py-12">
          No tutors found for that course yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((tutor) => (
            <TutorCard key={tutor.id} {...tutor} />
          ))}
        </div>
      )}
    </div>
  );
}
