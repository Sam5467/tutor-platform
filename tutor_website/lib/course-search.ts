// Forgiving course search: "calc 2" finds "Calculus II", "math202" finds
// "MATH 202", and capitals, dots and dashes are ignored.
const ROMAN: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4", v: "5" };

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/([a-z])(\d)/g, "$1 $2") // math202 -> math 202
    .replace(/(\d)([a-z])/g, "$1 $2")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((t) => ROMAN[t] ?? t);
}

// Every word typed must start a word in the course ("calc" -> "calculus").
// Short numbers must match exactly, so "calc 2" doesn't find "Calculus 201".
export function courseMatches(course: string, query: string): boolean {
  const q = tokens(query);
  if (q.length === 0) return true;
  const c = tokens(course);
  return q.every((qt) =>
    c.some((ct) =>
      /^\d{1,2}$/.test(qt) ? ct === qt : ct.startsWith(qt)
    )
  );
}

export function tutorMatchesCourse(courses: string[], query: string): boolean {
  return courses.some((c) => courseMatches(c, query));
}
