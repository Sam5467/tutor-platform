import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TUTOR_COLUMNS, rowToTutor, type TutorRow } from "@/lib/tutors";
import { ContactButton } from "@/components/contact-button";
import { BackButton } from "@/components/back-button";
import { ReviewsSection } from "@/components/reviews-section";
import { getStudentsOpen, LOCAL_PREVIEW } from "@/lib/site-settings";
import { demoTutors } from "@/lib/demo-tutors";
import type { Tutor } from "@/lib/tutors";
import { sessionModeLabel } from "@/lib/session-modes";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TutorProfilePage({ params }: PageProps) {
  const { id } = await params;

  // Testing locally: the demo tutors get a profile page too.
  if (LOCAL_PREVIEW && id.startsWith("demo-")) {
    const demo = demoTutors().find((t) => t.id === id);
    if (!demo) notFound();
    return <TutorProfile tutor={demo} demo />;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("tutors")
    .select(`${TUTOR_COLUMNS}, student_id, paid_until`)
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const tutor = rowToTutor(data as TutorRow);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === (data as { student_id: string }).student_id;

  // What the owner sees about whether their listing is live.
  let listingNote = "";
  if (isOwnProfile) {
    const studentsOpen = await getStudentsOpen();
    const paidUntil = (data as { paid_until: string | null }).paid_until;
    if (tutor.status === "pending") {
      listingNote = "Your application is under review.";
    } else if (tutor.status === "rejected") {
      listingNote = "Your application wasn't approved. Contact us if you think this is a mistake.";
    } else if (!paidUntil) {
      listingNote = studentsOpen
        ? "Your listing isn't active right now. Contact us to renew."
        : "You're approved! Your free period starts the day we open the site to students.";
    } else if (new Date(paidUntil) > new Date()) {
      listingNote = `Your listing is live until ${new Date(
        paidUntil
      ).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}.`;
    } else {
      listingNote =
        "Your listing has ended and is hidden from students. Contact us to renew.";
    }
  }

  return (
    <TutorProfile
      tutor={tutor}
      isOwnProfile={isOwnProfile}
      listingNote={listingNote}
    />
  );
}

function TutorProfile({
  tutor,
  isOwnProfile = false,
  listingNote = "",
  demo = false,
}: {
  tutor: Tutor;
  isOwnProfile?: boolean;
  listingNote?: string;
  demo?: boolean;
}) {
  const initials = tutor.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <BackButton fallback="/tutors" label="Back" />
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            {tutor.photoUrl ? (
              <img
                src={tutor.photoUrl}
                alt={tutor.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-stone border border-ink/10 flex items-center justify-center text-ink font-display text-xl">
                {initials}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl text-ink">{tutor.name}</h1>
              <p className="text-slate text-sm">
                {tutor.major} · {tutor.year}
              </p>
              <p className="text-slate text-sm">
                {tutor.university} · {sessionModeLabel(tutor.sessionMode)}
              </p>
            </div>
          </div>

          <p className="text-ink mb-6">{tutor.bio}</p>

          <p className="text-sm text-slate mb-1">Courses taught</p>
          <p className="text-ink mb-6">{tutor.courses.join(", ")}</p>

          {demo ? (
            <p className="text-sm text-slate">
              Demo tutor: reviews aren&apos;t shown.
            </p>
          ) : (
            <ReviewsSection tutorId={tutor.id} hideForm={isOwnProfile} />
          )}
        </div>

        <div className="sm:w-64 flex flex-col gap-6">
          <div className="border border-brass rounded-lg p-4 text-center">
            <p className="text-2xl font-display text-brass">
              ${tutor.pricePerSession}
            </p>
            <p className="text-xs text-slate">per session</p>
          </div>

          {isOwnProfile ? (
            <div className="flex flex-col gap-3 border border-stone rounded-lg p-4 text-center">
              <p className="text-sm text-slate">This is your own listing.</p>
              {listingNote && (
                <p className="text-xs text-ink">{listingNote}</p>
              )}
              <Link
                href={`/tutors/${tutor.id}/edit`}
                className="rounded-full bg-ink text-paper px-6 py-3 text-sm font-medium"
              >
                Edit my listing
              </Link>
            </div>
          ) : (
            <ContactButton tutorId={tutor.id} demo={demo} />
          )}
        </div>
      </div>
    </div>
  );
}
