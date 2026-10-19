// Fake tutors for previewing the browse page locally (npm run dev only).
// Never shown on the live site.
import type { Tutor } from "@/lib/tutors";
import type { SessionMode } from "@/lib/session-modes";
import { universities } from "@/lib/universities";

const FIRST = ["Rami", "Maya", "Karim", "Lea", "Joe", "Nour", "Elie", "Sara", "Hadi", "Yara", "Charbel", "Tala", "Marc", "Rita", "Ali", "Christelle", "Georges", "Lynn", "Omar", "Perla"];
const LAST = ["Haddad", "Khoury", "Nassar", "Saab", "Abi Rached", "Fakhoury", "Mansour", "Karam", "El Hage", "Daher", "Tannous", "Aoun"];
const YEARS = ["Junior", "Senior", "Senior", "Master's 1st year", "Graduate"];
const MODES: SessionMode[] = ["online", "in_person", "both", "both"];
const CS_COURSES = ["CSC 210 Data Structures", "MATH 202", "Calculus II", "CSC 330 Algorithms", "Discrete Mathematics", "Intro to Programming", "Databases", "Operating Systems", "Linear Algebra", "Object-Oriented Programming", "Computer Networks"];

function pick<T>(list: T[], i: number): T {
  return list[i % list.length];
}

export function demoTutors(): Tutor[] {
  const result: Tutor[] = [];
  for (let i = 0; i < 36; i++) {
    const courseCount = 1 + (i % 6);
    const hasRating = i % 3 !== 0;
    result.push({
      id: `demo-${i}`,
      name: `${pick(FIRST, i * 7)} ${pick(LAST, i * 5)}`,
      university: universities[i % universities.length].short,
      sessionMode: pick(MODES, i),
      faculty: "Computer Science and IT",
      major: "Computer Science",
      year: pick(YEARS, i),
      courses: Array.from({ length: courseCount }, (_, k) => pick(CS_COURSES, i + k * 3)),
      pricePerSession: 10 + ((i * 7) % 26),
      rating: hasRating ? 3.5 + ((i * 3) % 16) / 10 : null,
      reviewCount: hasRating ? 1 + (i % 14) : 0,
      photoUrl: null,
      joinedAt: new Date(2026, 9, 1 + (i % 28)).toISOString(),
      bio: "Demo tutor for previewing the layout.",
      status: "approved",
    });
  }
  return result;
}
