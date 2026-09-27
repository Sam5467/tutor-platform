"use client";

import { useState } from "react";
import { FacultyPicker } from "@/components/faculty-picker";
import { SubFacultyPicker } from "@/components/sub-faculty-picker";
import { MajorPicker } from "@/components/major-picker";
import { TutorGrid } from "@/components/tutor-grid";
import { mockTutors } from "@/lib/mock-data";
import { faculties } from "@/lib/faculties";

export default function TutorsPage() {
  const [faculty, setFaculty] = useState<string | null>(null);
  const [subFaculty, setSubFaculty] = useState<string | null>(null);
  const [major, setMajor] = useState<string | null>(null);

  const facultyData = faculty
    ? faculties.find((f) => f.name === faculty)
    : null;
  const needsSubFacultyStep = (facultyData?.subFaculties.length ?? 0) > 1;
  const totalSteps = needsSubFacultyStep ? 3 : 2;

  if (!faculty) {
    return <FacultyPicker onSelect={setFaculty} />;
  }

  // Faculties with only one sub-faculty skip the sub-faculty screen entirely,
  // but we still need to know that single sub-faculty's name to look up majors.
  const effectiveSubFaculty =
    subFaculty ?? (!needsSubFacultyStep ? facultyData?.subFaculties[0]?.name ?? null : null);

  if (needsSubFacultyStep && !subFaculty) {
    return (
      <SubFacultyPicker
        faculty={faculty}
        onSelect={setSubFaculty}
        onBack={() => setFaculty(null)}
      />
    );
  }

  if (!major) {
    return (
      <MajorPicker
        faculty={faculty}
        subFaculty={effectiveSubFaculty!}
        step={needsSubFacultyStep ? 3 : 2}
        totalSteps={totalSteps}
        onSelect={setMajor}
        onBack={() => {
          if (needsSubFacultyStep) {
            setSubFaculty(null);
          } else {
            setFaculty(null);
          }
        }}
      />
    );
  }

  const tutors = mockTutors.filter(
    (t) => t.faculty === faculty && t.major === major
  );

  return (
    <TutorGrid
      tutors={tutors}
      onBack={() => {
        setMajor(null);
      }}
    />
  );
}
