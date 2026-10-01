"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";

type Status = "pending" | "approved" | "rejected";

type TutorRow = {
  id: string;
  full_name: string;
  faculty: string;
  major: string;
  year: string;
  courses: string;
  price: number | string;
  bio: string | null;
  status: Status;
  is_paid: boolean;
  created_at: string;
  profile_picture_path: string | null;
  gpa: number | null;
  phone: string | null;
  transcript_path: string | null;
};

const FILTERS: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function AdminDashboard() {
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTutors() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("tutors")
        .select(
          "id, full_name, faculty, major, year, courses, price, bio, status, is_paid, created_at, profile_picture_path, tutor_private(gpa, phone, transcript_path)"
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        // GPA, phone and transcript live in a separate private table; flatten them.
        setTutors(
          (data ?? []).map((t) => {
            const priv = Array.isArray(t.tutor_private)
              ? t.tutor_private[0]
              : t.tutor_private;
            return {
              id: t.id,
              full_name: t.full_name,
              faculty: t.faculty,
              major: t.major,
              year: t.year,
              courses: t.courses,
              price: t.price,
              bio: t.bio,
              status: t.status,
              is_paid: t.is_paid,
              created_at: t.created_at,
              profile_picture_path: t.profile_picture_path,
              gpa: priv?.gpa ?? null,
              phone: priv?.phone ?? null,
              transcript_path: priv?.transcript_path ?? null,
            };
          })
        );
      }
      setLoading(false);
    }

    loadTutors();
  }, []);

  const majorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tutors) {
      counts[t.major] = (counts[t.major] ?? 0) + 1;
    }
    return Object.entries(counts).map(([major, count]) => ({ major, count }));
  }, [tutors]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tutors.length };
    for (const t of tutors) {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    }
    return counts;
  }, [tutors]);

  const visibleTutors =
    filter === "all" ? tutors : tutors.filter((t) => t.status === filter);

  const setStatus = async (tutor: TutorRow, status: Status) => {
    if (status === "rejected") {
      const action = tutor.status === "approved" ? "Unlist" : "Reject";
      if (!window.confirm(`${action} ${tutor.full_name}?`)) return;
    }

    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("tutors")
      .update({ status })
      .eq("id", tutor.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTutors((prev) =>
      prev.map((t) => (t.id === tutor.id ? { ...t, status } : t))
    );
  };

  const removeTutor = async (tutor: TutorRow) => {
    if (
      !window.confirm(
        `Remove ${tutor.full_name} permanently?\n\nThis deletes their listing, their reviews, their contact history and their uploaded files. This can't be undone. (Their student account stays, and they could apply again.)`
      )
    ) {
      return;
    }

    setError("");
    const supabase = createClient();
    const { data: deleted, error: deleteError } = await supabase
      .from("tutors")
      .delete()
      .eq("id", tutor.id)
      .select("id");

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    if (!deleted || deleted.length === 0) {
      setError("Couldn't remove that tutor. Please reload and try again.");
      return;
    }

    // Clean up the uploaded files too (best effort).
    if (tutor.transcript_path) {
      await supabase.storage.from("transcripts").remove([tutor.transcript_path]);
    }
    if (tutor.profile_picture_path) {
      await supabase.storage
        .from("profile-pictures")
        .remove([tutor.profile_picture_path]);
    }

    setTutors((prev) => prev.filter((t) => t.id !== tutor.id));
    if (openId === tutor.id) setOpenId(null);
  };

  // The transcripts bucket is private, so we ask for a link that expires
  // after 60 seconds instead of a permanent public URL.
  const viewTranscript = async (path: string) => {
    const supabase = createClient();
    const { data, error: urlError } = await supabase.storage
      .from("transcripts")
      .createSignedUrl(path, 60);

    if (urlError || !data) {
      setError(urlError?.message ?? "Couldn't open the transcript.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const togglePayment = async (tutor: TutorRow) => {
    const next = !tutor.is_paid;
    if (
      !window.confirm(
        `Mark ${tutor.full_name} as ${next ? "paid" : "unpaid"}?`
      )
    ) {
      return;
    }

    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("tutors")
      .update({ is_paid: next })
      .eq("id", tutor.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTutors((prev) =>
      prev.map((t) => (t.id === tutor.id ? { ...t, is_paid: next } : t))
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4">
        <p className="text-slate">Loading tutors...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-2">Admin dashboard</h1>
      <p className="text-sm text-slate mb-10">
        Changes here are saved to the real database.
      </p>

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg text-ink mb-4">
            Manage tutors
          </h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-4 py-1.5 text-xs border ${
                  filter === f.value
                    ? "bg-ink text-paper border-ink"
                    : "border-stone text-slate"
                }`}
              >
                {f.label} ({statusCounts[f.value] ?? 0})
              </button>
            ))}
          </div>

          {visibleTutors.length === 0 ? (
            <p className="text-slate text-sm">No tutors here.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex flex-col min-w-[760px]">
                <div className="grid grid-cols-6 gap-4 text-xs text-slate uppercase pb-2 border-b border-stone">
                  <span>Name</span>
                  <span>Major</span>
                  <span>GPA / Transcript</span>
                  <span>Status</span>
                  <span>Payment</span>
                  <span>Actions</span>
                </div>
                {visibleTutors.map((tutor) => (
                  <div key={tutor.id} className="border-b border-stone">
                    <div className="grid grid-cols-6 gap-4 items-center py-4 text-sm">
                      <div className="flex flex-col items-start">
                        <span className="text-ink">{tutor.full_name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenId(openId === tutor.id ? null : tutor.id)
                          }
                          className="text-xs text-slate underline"
                        >
                          {openId === tutor.id ? "Hide details" : "Details"}
                        </button>
                      </div>
                      <span className="text-slate">{tutor.major}</span>
                      <div className="flex flex-col items-start">
                        <span className="text-slate">
                          {tutor.gpa !== null
                            ? Number(tutor.gpa).toFixed(2)
                            : "—"}
                        </span>
                        {tutor.transcript_path ? (
                          <button
                            type="button"
                            onClick={() =>
                              viewTranscript(tutor.transcript_path!)
                            }
                            className="text-ink underline text-xs"
                          >
                            View transcript
                          </button>
                        ) : (
                          <span className="text-xs text-slate">
                            No transcript
                          </span>
                        )}
                      </div>
                      <span
                        className={
                          tutor.status === "approved"
                            ? "text-green-700"
                            : tutor.status === "rejected"
                            ? "text-red-600"
                            : "text-brass"
                        }
                      >
                        {tutor.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePayment(tutor)}
                        className={
                          tutor.is_paid
                            ? "text-green-700 underline text-left"
                            : "text-red-600 underline text-left"
                        }
                      >
                        {tutor.is_paid ? "paid" : "unpaid"}
                      </button>
                      <div className="flex flex-wrap gap-2">
                        {tutor.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => setStatus(tutor, "approved")}
                            className="rounded-full bg-ink text-paper px-3 py-1 text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {tutor.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => setStatus(tutor, "rejected")}
                            className="rounded-full border border-stone px-3 py-1 text-xs text-slate"
                          >
                            {tutor.status === "approved" ? "Unlist" : "Reject"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeTutor(tutor)}
                          className="rounded-full border border-red-600 px-3 py-1 text-xs text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {openId === tutor.id && (
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pb-5 text-sm">
                        <div>
                          <dt className="text-xs text-slate">Faculty</dt>
                          <dd className="text-ink">{tutor.faculty}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate">Year</dt>
                          <dd className="text-ink">{tutor.year}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate">Price / session</dt>
                          <dd className="text-ink">${Number(tutor.price)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate">Phone</dt>
                          <dd className="text-ink">
                            {tutor.phone ? `+${tutor.phone}` : "—"}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-slate">Courses</dt>
                          <dd className="text-ink">{tutor.courses}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-slate">Bio</dt>
                          <dd className="text-ink whitespace-pre-line">
                            {tutor.bio || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate">Applied</dt>
                          <dd className="text-ink">
                            {new Date(tutor.created_at).toLocaleDateString()}
                          </dd>
                        </div>
                      </dl>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <h2 className="font-display text-lg text-ink mb-4">
            Tutors by major
          </h2>
          <BarChart data={majorCounts} xDataKey="major" aspectRatio="1 / 1">
            <Grid />
            <Bar dataKey="count" fill="var(--color-brass)" />
            <ChartTooltip />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
