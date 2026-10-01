export type TutorRow = {
  id: string;
  full_name: string;
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
  name: string;
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
  "id, full_name, faculty, major, year, courses, price, bio, status, is_paid, profile_picture_path, created_at";

export function rowToTutor(row: TutorRow): Tutor {
  const photoUrl = row.profile_picture_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${row.profile_picture_path}`
    : null;

  return {
    id: row.id,
    name: row.full_name,
    faculty: row.faculty,
    major: row.major,
    year: row.year,
    courses: row.courses
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
    pricePerSession: Number(row.price),
    // Reviews aren't wired to the database yet.
    rating: null,
    reviewCount: 0,
    photoUrl,
    joinedAt: row.created_at,
    bio: row.bio ?? "",
    status: row.status,
  };
}
