import { notFound } from "next/navigation";
import { mockTutors } from "@/lib/mock-data";
import { mockReviews } from "@/lib/mock-reviews";
import { ContactButton } from "@/components/contact-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TutorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const tutor = mockTutors.find((t) => t.id === id);

  if (!tutor) {
    notFound();
  }

  const reviews = mockReviews.filter((r) => r.tutorId === id);
  const initials = tutor.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
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
            </div>
          </div>

          <p className="text-ink mb-6">{tutor.bio}</p>

          <p className="text-sm text-slate mb-1">Courses taught</p>
          <p className="text-ink mb-6">{tutor.courses.join(", ")}</p>

          <h2 className="font-display text-lg text-ink mb-3">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-slate text-sm">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-t border-stone pt-4">
                  <p className="text-sm font-medium text-ink">
                    {review.studentName} — {review.rating}/5
                  </p>
                  <p className="text-sm text-slate">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sm:w-64 flex flex-col gap-6">
          <div className="border border-brass rounded-lg p-4 text-center">
            <p className="text-2xl font-display text-brass">
              ${tutor.pricePerSession}
            </p>
            <p className="text-xs text-slate">per session</p>
          </div>

          <ContactButton tutorId={tutor.id} phone={tutor.phone} />
        </div>
      </div>
    </div>
  );
}
