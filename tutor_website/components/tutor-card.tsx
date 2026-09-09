import Link from "next/link";

type TutorCardProps = {
  id: string;
  name: string;
  major: string;
  year: string;
  courses: string[];
  pricePerSession: number;
  rating: number | null;
  reviewCount: number;
};

export function TutorCard({
  id,
  name,
  major,
  year,
  courses,
  pricePerSession,
  rating,
  reviewCount,
}: TutorCardProps) {
  const shownCourses = courses.slice(0, 3);
  const extraCount = courses.length - shownCourses.length;

  return (
    <Link
      href={`/tutors/${id}`}
      className="hairline-divider flex items-center justify-between gap-6 py-6 group"
    >
      <div>
        <p className="font-display text-xl text-ink group-hover:text-brass transition-colors">
          {name}
        </p>
        <p className="text-slate text-sm mt-1">
          {major}, {year}
        </p>
        <p className="text-slate text-sm mt-1">
          {shownCourses.join(", ")}
          {extraCount > 0 && ` +${extraCount} more`}
        </p>
        {rating !== null && (
          <p className="text-slate text-sm mt-1">
            {rating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
          </p>
        )}
      </div>

      <span className="shrink-0 rounded-full border border-brass px-4 py-1.5 text-sm text-brass">
        ${pricePerSession}/session
      </span>
    </Link>
  );
}
