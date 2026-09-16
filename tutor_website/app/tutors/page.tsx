"use client";

import { useState } from "react";
import { FacultyPicker } from "@/components/faculty-picker";
import { MajorPicker } from "@/components/major-picker";
import { TutorGrid } from "@/components/tutor-grid";
import { mockTutors } from "@/lib/mock-data";

export default function TutorsPage() {
  const [faculty, setFaculty] = useState<string | null>(null);
  const [major, setMajor] = useState<string | null>(null);

  if (!faculty) {
    return <FacultyPicker onSelect={setFaculty} />;
  }

  if (!major) {
    return (
      <MajorPicker
        faculty={faculty}
        onSelect={setMajor}
        onBack={() => setFaculty(null)}
      />
    );
  }

  const tutors = mockTutors.filter(
    (t) => t.faculty === faculty && t.major === major
  );

  return <TutorGrid tutors={tutors} onBack={() => setMajor(null)} />;
}
