"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { FieldPicker } from "@/components/field-picker";
import { MajorPicker } from "@/components/major-picker";
import { TutorGrid } from "@/components/tutor-grid";
import { TutorGridSkeleton } from "@/components/skeleton";
import { createClient } from "@/lib/supabase/client";
import { dbErrorMessage } from "@/lib/errors";
import { tutorMatchesCourse } from "@/lib/course-search";
import { demoTutors } from "@/lib/demo-tutors";
import { TEST_MODE } from "@/lib/test-mode";
import { fields } from "@/lib/fields";
import type { SessionMode } from "@/lib/session-modes";
import {
  TUTOR_COLUMNS,
  rowToTutor,
  type Tutor,
  type TutorRow,
} from "@/lib/tutors";

export function TutorsBrowser() {
  // Where the student is (field, major, filters, search) lives in the page
  // address, so going back from a tutor's profile returns to the same spot.
  const params = useSearchParams();
  const fieldParam = params.get("field");
  const field = fields.some((f) => f.name === fieldParam) ? fieldParam : null;
  const major = field ? params.get("major") : null;
  const university = params.get("university") ?? "all";
  const mode = (params.get("mode") ?? "any") as SessionMode | "any";
  const [query, setQueryState] = useState(params.get("q") ?? "");

  // push: a step the phone/browser back button should return to.
  const updateUrl = (changes: Record<string, string | null>, push = true) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };

  const setField = (value: string | null) =>
    updateUrl({ field: value, major: null, university: null, mode: null });
  const setMajor = (value: string | null) =>
    updateUrl({ major: value, university: null, mode: null });
  const setQuery = (value: string) => {
    setQueryState(value);
    updateUrl({ q: value.trim() ? value : null }, false);
  };
  const filterProps = {
    university,
    mode,
    onUniversityChange: (value: string) =>
      updateUrl({ university: value === "all" ? null : value }, false),
    onModeChange: (value: SessionMode | "any") =>
      updateUrl({ mode: value === "any" ? null : value }, false),
  };
  const [tutors, setTutors] = useState<Tutor[] | null>(null);
  const [fetchError, setFetchError] = useState("");

  // Load every approved tutor once; picking a field, a major or searching
  // then happens instantly on the page.
  useEffect(() => {
    async function loadTutors() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tutors")
        .select(TUTOR_COLUMNS)
        .eq("status", "approved")
        .order("created_at", { ascending: true });

      if (error) {
        setFetchError(
          dbErrorMessage(
            error,
            {},
            "We couldn't load the tutors. Please try again."
          )
        );
      }
      const loaded = ((data ?? []) as TutorRow[]).map(rowToTutor);

      // Average rating per tutor, from the public reviews.
      if (loaded.length > 0) {
        const { data: reviewRows } = await supabase
          .from("reviews")
          .select("tutor_id, rating");

        const totals: Record<string, { sum: number; count: number }> = {};
        for (const r of reviewRows ?? []) {
          const entry = (totals[r.tutor_id] ??= { sum: 0, count: 0 });
          entry.sum += r.rating;
          entry.count += 1;
        }
        for (const t of loaded) {
          const entry = totals[t.id];
          if (entry) {
            t.rating = entry.sum / entry.count;
            t.reviewCount = entry.count;
          }
        }
      }

      // Test mode: add the demo tutors.
      if (TEST_MODE) {
        loaded.push(...demoTutors());
      }

      setTutors(loaded);
    }

    loadTutors();
  }, []);

  const searching = query.trim().length > 0;

  // Picking a field or major needs no data; only the tutor lists wait.
  const needsTutors = searching || (field && major);

  let view: React.ReactNode;
  if (needsTutors && tutors === null) {
    view = <TutorGridSkeleton />;
  } else if (tutors && searching) {
    // A search covers the chosen major, or every tutor when none is chosen.
    const pool = major
      ? tutors.filter((t) => t.faculty === field && t.major === major)
      : tutors;
    view = (
      <TutorGrid
        tutors={pool.filter((t) => tutorMatchesCourse(t.courses, query))}
        heading={`Results for "${query.trim()}"`}
        onBack={() => setQuery("")}
        backLabel="Clear search"
        {...filterProps}
      />
    );
  } else if (!field) {
    view = <FieldPicker onSelect={setField} />;
  } else if (!major) {
    view = (
      <MajorPicker
        field={field}
        onSelect={setMajor}
        onBack={() => setField(null)}
      />
    );
  } else {
    view = (
      <TutorGrid
        tutors={(tutors ?? []).filter((t) => t.faculty === field && t.major === major)}
        heading={major}
        onBack={() => setMajor(null)}
        backLabel="Back to majors"
        {...filterProps}
      />
    );
  }

  return (
    <>
      <div className="max-w-xl mx-auto px-4 pt-6">
        <label className="relative block">
          <span className="sr-only">Search a course</span>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate"
            size={18}
          />
          <input
            type="search"
            placeholder="Search a course (e.g. Calculus 2, MATH 202)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-stone rounded-full py-3 pl-10 pr-4 text-base text-ink bg-paper"
          />
        </label>
        {fetchError && (
          <p className="text-sm text-red-600 text-center pt-4">{fetchError}</p>
        )}
      </div>
      {view}
    </>
  );
}
