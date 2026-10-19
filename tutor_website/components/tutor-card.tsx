import Link from "next/link";
import type { Tutor } from "@/lib/tutors";
import { fieldCardColors } from "@/lib/field-card-colors";
import { sessionModeLabel } from "@/lib/session-modes";

// className replaces the default "flex" (e.g. "hidden sm:flex").
type TutorCardProps = Tutor & { className?: string };

export function TutorCard({
  id,
  name,
  university,
  sessionMode,
  faculty,
  year,
  courses,
  pricePerSession,
  rating,
  reviewCount,
  photoUrl,
  className = "",
}: TutorCardProps) {
  const shownCourses = courses.slice(0, 3);
  const extraCount = courses.length - shownCourses.length;
  const colors = fieldCardColors[faculty] ?? { bg: "bg-paper", text: "text-ink" };
  const divider = colors.text === "text-paper" ? "border-paper/20" : "border-ink/20";
  const chip = colors.text === "text-paper" ? "bg-paper/15" : "bg-ink/10";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/tutors/${id}`}
      className={`${className || "flex"} flex-col gap-2.5 rounded-lg p-4 hover:opacity-90 transition-opacity ${colors.bg} ${colors.text}`}
    >
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-12 h-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 shrink-0 rounded-full bg-stone flex items-center justify-center text-ink font-display text-sm">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-base leading-tight truncate">{name}</p>
          <p className="text-xs opacity-70 truncate">
            {university} · {year}
          </p>
        </div>
        <div className="shrink-0 text-right leading-tight">
          <p className="text-base font-semibold">${pricePerSession}</p>
          <p className="text-[11px] opacity-70">per session</p>
        </div>
      </div>

      <p className="text-sm opacity-80 line-clamp-2">
        {shownCourses.join(", ")}
        {extraCount > 0 && ` +${extraCount} more`}
      </p>

      <div className={`mt-auto pt-2.5 border-t ${divider} flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs`}>
        <span className={`rounded-full px-2 py-0.5 ${chip}`}>
          {sessionModeLabel(sessionMode)}
        </span>
        {rating !== null && (
          <span className="opacity-80">
            ★ {rating.toFixed(1)} ({reviewCount})
          </span>
        )}
      </div>
    </Link>
  );
}
