"use client";

import { useEffect, useState } from "react";
import { FacultyPicker } from "@/components/faculty-picker";
import { SubFacultyPicker } from "@/components/sub-faculty-picker";
import { MajorPicker } from "@/components/major-picker";
import { TutorGrid } from "@/components/tutor-grid";
import { faculties } from "@/lib/faculties";
import { createClient } from "@/lib/supabase/client";
import {
  TUTOR_COLUMNS,
  rowToTutor,
  type Tutor,
  type TutorRow,
} from "@/lib/tutors";

export default function TutorsPage() {
  const [faculty, setFaculty] = useState<string | null>(null);
  const [subFaculty, setSubFaculty] = useState<string | null>(null);
  const [major, setMajor] = useState<string | null>(null);
  const [tutors, setTutors] = useState<Tutor[] | null>(null);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!faculty || !major) return;
    const selectedFaculty = faculty;
    const selectedMajor = major;

    async function loadTutors() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tutors")
        .select(TUTOR_COLUMNS)
        .eq("status", "approved")
        .eq("faculty", selectedFaculty)
        .eq("major", selectedMajor)
        .order("created_at", { ascending: true });

      if (error) {
        setFetchError(error.message);
        setTutors([]);
        return;
      }
      setFetchError("");
      setTutors((data as TutorRow[]).map(rowToTutor));
    }

    loadTutors();
  }, [faculty, major]);

  const facultyData = faculty
    ? faculties.find((f) => f.name === faculty)
    : null;
  const needsSubFacultyStep = (facultyData?.subFaculties.length ?? 0) > 1;
  const totalSteps = needsSubFacultyStep ? 3 : 2;

  if (!faculty) {
    return <FacultyPicker onSelect={setFaculty} />;
  }

  const effectiveSubFaculty =
    subFaculty ??
    (!needsSubFacultyStep ? facultyData?.subFaculties[0]?.name ?? null : null);

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
        onSelect={(m) => {
          setTutors(null);
          setMajor(m);
        }}
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

  if (tutors === null) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4">
        <p className="text-slate text-center">Loading tutors...</p>
      </div>
    );
  }

  return (
    <>
      {fetchError && (
        <p className="text-sm text-red-600 text-center pt-8">{fetchError}</p>
      )}
      <TutorGrid
        tutors={tutors}
        onBack={() => {
          setTutors(null);
          setMajor(null);
        }}
      />
    </>
  );
}
