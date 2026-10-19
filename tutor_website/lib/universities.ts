// Universities a tutor can belong to. Shown as a badge on tutor cards and used
// as an optional filter when browsing.
export const universities = [
  { short: "AUB", name: "American University of Beirut" },
  { short: "LAU", name: "Lebanese American University" },
  { short: "USJ", name: "Université Saint-Joseph de Beyrouth" },
  { short: "USEK", name: "Holy Spirit University of Kaslik" },
  { short: "NDU", name: "Notre Dame University – Louaizé" },
  { short: "LU", name: "Lebanese University" },
  { short: "BAU", name: "Beirut Arab University" },
  { short: "UOB", name: "University of Balamand" },
] as const;

export type UniversityShort = (typeof universities)[number]["short"];

export function isUniversity(value: string): value is UniversityShort {
  return universities.some((u) => u.short === value);
}
