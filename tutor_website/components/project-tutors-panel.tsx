"use client";

import { useState } from "react";
import { universityLabel } from "@/lib/universities";

type ProjectTutor = {
  id: string;
  slug: string | null;
  full_name: string;
  university: string;
  faculty: string;
  major: string;
  phone: string | null;
  can_do_projects: boolean;
  can_do_thesis: boolean;
};

type Filter = "all" | "projects" | "thesis";

// Approved tutors who said they can help with projects and/or a thesis,
// grouped by field, so the admin can match project and thesis requests.
export function ProjectTutorsPanel({ tutors }: { tutors: ProjectTutor[] }) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const helpers = tutors.filter((t) => t.can_do_projects || t.can_do_thesis);
  const shown = helpers.filter(
    (t) =>
      filter === "all" ||
      (filter === "projects" ? t.can_do_projects : t.can_do_thesis)
  );

  // Field -> its tutors, fields with the most tutors first.
  const byField = new Map<string, ProjectTutor[]>();
  for (const t of shown) {
    byField.set(t.faculty, [...(byField.get(t.faculty) ?? []), t]);
  }
  const groups = [...byField.entries()]
    .map(([field, list]) => ({
      field,
      list: list.sort(
        (a, b) =>
          a.major.localeCompare(b.major) || a.full_name.localeCompare(b.full_name)
      ),
    }))
    .sort((a, b) => b.list.length - a.list.length || a.field.localeCompare(b.field));

  const projectsCount = helpers.filter((t) => t.can_do_projects).length;
  const thesisCount = helpers.filter((t) => t.can_do_thesis).length;

  return (
    <div className="border border-stone rounded-lg p-5 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-ink">
            Project / Thesis tutors ({helpers.length})
          </h2>
          <p className="text-sm text-slate">
            {projectsCount} can help with projects · {thesisCount} with a thesis.
            Grouped by field, to match project and thesis requests.
          </p>
        </div>
        {helpers.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-full border border-stone px-4 py-2 text-xs text-slate shrink-0"
          >
            {expanded ? "Hide list" : `Show list (${helpers.length})`}
          </button>
        )}
      </div>

      {helpers.length === 0 && (
        <p className="text-sm text-slate mt-4">
          No approved tutor has ticked projects or thesis yet.
        </p>
      )}

      {expanded && helpers.length > 0 && (
        <div className="mt-5 flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", `All (${helpers.length})`],
                ["projects", `Projects (${projectsCount})`],
                ["thesis", `Thesis (${thesisCount})`],
              ] as [Filter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-1.5 text-xs border ${
                  filter === value
                    ? "bg-ink text-paper border-ink"
                    : "border-stone text-slate"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {groups.map(({ field, list }) => (
            <section key={field}>
              <h3 className="font-display text-ink border-b border-stone pb-1.5 mb-1">
                {field}{" "}
                <span className="text-sm text-slate font-sans">({list.length})</span>
              </h3>
              <ul className="flex flex-col divide-y divide-stone text-sm">
                {list.map((t) => (
                  <li
                    key={t.id}
                    className="py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5"
                  >
                    <div className="min-w-0">
                      <a
                        href={`/tutors/${t.slug || t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink underline underline-offset-2"
                      >
                        {t.full_name}
                      </a>
                      <p className="text-xs text-slate">
                        {t.major} · {universityLabel(t.university)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {t.can_do_projects && (
                        <span className="rounded-full bg-brass/15 text-ink px-2.5 py-0.5">
                          Projects
                        </span>
                      )}
                      {t.can_do_thesis && (
                        <span className="rounded-full bg-ink/10 text-ink px-2.5 py-0.5">
                          Thesis
                        </span>
                      )}
                      {t.phone && (
                        <a
                          href={`https://wa.me/${t.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-brass text-paper px-3 py-1"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
