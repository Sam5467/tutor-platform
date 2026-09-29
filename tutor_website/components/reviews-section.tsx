"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student_name: string;
};

type ReviewsSectionProps = {
  tutorId: string;
  hideForm?: boolean;
};

export function ReviewsSection({ tutorId, hideForm = false }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [hasContacted, setHasContacted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadReviews() {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, student_name")
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      await loadReviews();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setLoggedIn(true);

      const { data: contactRow } = await supabase
        .from("contact_requests")
        .select("id")
        .eq("student_id", user.id)
        .eq("tutor_id", tutorId)
        .maybeSingle();
      setHasContacted(!!contactRow);

      const { data: reviewRow } = await supabase
        .from("reviews")
        .select("id")
        .eq("student_id", user.id)
        .eq("tutor_id", tutorId)
        .maybeSingle();
      setAlreadyReviewed(!!reviewRow);
    }

    load();
  }, [tutorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      return;
    }

    const { data: studentRow } = await supabase
      .from("students")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const { error: insertError } = await supabase.from("reviews").insert({
      student_id: user.id,
      tutor_id: tutorId,
      rating,
      comment: comment.trim() ? comment.trim() : null,
      student_name: studentRow?.full_name ?? "A student",
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAlreadyReviewed(true);
    setRating(0);
    setComment("");
    await loadReviews();
  };

  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-3">Reviews</h2>

      {reviews === null ? (
        <p className="text-slate text-sm">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-slate text-sm mb-6">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-t border-stone pt-4">
              <p className="text-sm font-medium text-ink">
                {review.student_name} — {review.rating}/5
              </p>
              {review.comment && (
                <p className="text-sm text-slate">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!hideForm && loggedIn && hasContacted && !alreadyReviewed && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-stone pt-6"
        >
          <p className="text-sm text-slate">Leave a review</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? "text-brass" : "text-stone"
                }`}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment"
            rows={3}
            className="border border-stone rounded-lg py-2 px-4 text-ink text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-ink text-paper px-6 py-2 text-sm font-medium w-fit disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      {!hideForm && loggedIn && alreadyReviewed && (
        <p className="text-sm text-slate border-t border-stone pt-6">
          Thanks — you've already left a review for this tutor.
        </p>
      )}
    </div>
  );
}
