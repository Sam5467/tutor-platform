import Link from "next/link";
import type { Tutor } from "@/lib/tutors";
import { facultyCardColors } from "@/lib/faculty-card-colors";

type TutorCardProps = Tutor;

export function TutorCard({
  id,
  name,
  faculty,
  year,
  courses,
  pricePerSession,
  rating,
  reviewCount,
  photoUrl,
}: TutorCardProps) {
  const shownCourses = courses.slice(0, 3);
  const extraCount = courses.length - shownCourses.length;
  const colors = facultyCardColors[faculty] ?? { bg: "bg-paper", text: "text-ink" };
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/tutors/${id}`}
      className={`flex flex-col gap-3 rounded-lg p-4 hover:opacity-90 transition-opacity ${colors.bg}`}
    >
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-stone flex items-center justify-center text-ink font-display text-sm">
            {initials}
          </div>
        )}
        <div>
          <p className={`font-display text-base leading-tight ${colors.text}`}>{name}</p>
          <p className={`text-xs ${colors.text} opacity-70`}>{year}</p>
        </div>
      </div>

      <p className={`text-sm ${colors.text} opacity-80`}>
        {shownCourses.join(", ")}
        {extraCount > 0 && ` +${extraCount} more`}
      </p>

      {rating !== null && (
        <p className={`text-xs ${colors.text} opacity-70`}>
          {rating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? "" : "s"})
        </p>
      )}

      <div className={`mt-auto pt-3 border-t ${colors.text === "text-paper" ? "border-paper/20" : "border-ink/20"}`}>
        <span className={`text-sm font-semibold ${colors.text}`}>
          ${pricePerSession}/session
        </span>
      </div>
    </Link>
  );
}
