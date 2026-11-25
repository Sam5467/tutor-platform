import type { SessionMode } from "@/lib/session-modes";

export type TutorRow = {
  id: string;
  slug: string | null;
  full_name: string;
  university: string;
  session_mode: SessionMode;
  faculty: string;
  major: string;
  year: string;
  courses: string;
  price: number | string;
  bio: string | null;
  status: "pending" | "approved" | "rejected";
  is_paid: boolean;
  profile_picture_path: string | null;
  created_at: string;
};

export type Tutor = {
  id: string;
  // The nice link part, e.g. "maria-rahy" (demo tutors have none).
  slug?: string | null;
  name: string;
  university: string;
  sessionMode: SessionMode;
  faculty: string;
  major: string;
  year: string;
  courses: string[];
  pricePerSession: number;
  rating: number | null;
  reviewCount: number;
  photoUrl: string | null;
  joinedAt: string;
  bio: string;
  status: "pending" | "approved" | "rejected";
};

export const TUTOR_COLUMNS =
  "id, slug, full_name, university, session_mode, faculty, major, year, courses, price, bio, status, is_paid, profile_picture_path, created_at";

export function rowToTutor(row: TutorRow): Tutor {
  const photoUrl = row.profile_picture_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${row.profile_picture_path}`
    : null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.full_name,
    university: row.university,
    sessionMode: row.session_mode,
    faculty: row.faculty,
    major: row.major,
    year: row.year,
    courses: row.courses
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
    pricePerSession: Number(row.price),
    // Filled in afterwards by the pages that load reviews.
    rating: null,
    reviewCount: 0,
    photoUrl,
    joinedAt: row.created_at,
    bio: row.bio ?? "",
    status: row.status,
  };
}

// The address of a tutor's page: their name link when they have one.
export function tutorPath(tutor: { id: string; slug?: string | null }): string {
  return `/tutors/${tutor.slug || tutor.id}`;
}
