// Universities a tutor can belong to. Shown as a badge on tutor cards and used
// as an optional filter when browsing. "short" is what's saved for a tutor;
// "label" (if set) is how it's shown on cards and in the filter.
export const universities: readonly {
  short: string;
  name: string;
  label?: string;
}[] = [
  { short: "AUB", name: "American University of Beirut" },
  { short: "LAU", name: "Lebanese American University" },
  { short: "USJ", name: "Université Saint-Joseph de Beyrouth" },
  { short: "USEK", name: "Holy Spirit University of Kaslik" },
  { short: "NDU", name: "Notre Dame University, Louaizé" },
  { short: "LU", name: "Lebanese University" },
  { short: "BAU", name: "Beirut Arab University" },
  { short: "UOB", name: "University of Balamand" },
  { short: "LIU", name: "Lebanese International University" },
  { short: "AUST", name: "American University of Science and Technology" },
  { short: "UA", name: "Antonine University", label: "UA (Antonine)" },
  { short: "Haigazian", name: "Haigazian University" },
  { short: "ULS", name: "Université La Sagesse", label: "ULS (Sagesse)" },
  { short: "RHU", name: "Rafik Hariri University", label: "RHU (Rafik Hariri)" },
  { short: "MUBS", name: "Modern University for Business and Science" },
  { short: "AUL", name: "Arts, Sciences and Technology University in Lebanon" },
];

export function isUniversity(value: string): boolean {
  return universities.some((u) => u.short === value);
}

// How a saved university is shown to students, e.g. "UA" -> "UA (Antonine)".
export function universityLabel(short: string): string {
  return universities.find((u) => u.short === short)?.label ?? short;
}
