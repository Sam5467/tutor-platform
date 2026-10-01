"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";

type TutorRow = {
  id: string;
  full_name: string;
  major: string;
  status: "pending" | "approved" | "rejected";
  is_paid: boolean;
  gpa: number | null;
  transcript_path: string | null;
};

export function AdminDashboard() {
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTutors() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("tutors")
        .select("id, full_name, major, status, is_paid, gpa, transcript_path")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTutors(data ?? []);
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

  const handleApprove = async (id: string) => {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("tutors")
      .update({ status: "approved" })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTutors((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "approved" } : t))
    );
  };

  const handleReject = async (id: string) => {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("tutors")
      .update({ status: "rejected" })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTutors((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "rejected" } : t))
    );
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

  const togglePayment = async (id: string, currentlyPaid: boolean) => {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("tutors")
      .update({ is_paid: !currentlyPaid })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTutors((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_paid: !currentlyPaid } : t))
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
          {tutors.length === 0 ? (
            <p className="text-slate text-sm">No tutor applications yet.</p>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-6 gap-4 text-xs text-slate uppercase pb-2 border-b border-stone">
                <span>Name</span>
                <span>Major</span>
                <span>GPA / Transcript</span>
                <span>Status</span>
                <span>Payment</span>
                <span>Actions</span>
              </div>
              {tutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="grid grid-cols-6 gap-4 items-center py-4 border-b border-stone text-sm"
                >
                  <span className="text-ink">{tutor.full_name}</span>
                  <span className="text-slate">{tutor.major}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-slate">
                      {tutor.gpa !== null ? Number(tutor.gpa).toFixed(2) : "—"}
                    </span>
                    {tutor.transcript_path ? (
                      <button
                        onClick={() => viewTranscript(tutor.transcript_path!)}
                        className="text-ink underline text-xs"
                      >
                        View transcript
                      </button>
                    ) : (
                      <span className="text-xs text-slate">No transcript</span>
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
                    onClick={() => togglePayment(tutor.id, tutor.is_paid)}
                    className={
                      tutor.is_paid
                        ? "text-green-700 underline text-left"
                        : "text-red-600 underline text-left"
                    }
                  >
                    {tutor.is_paid ? "paid" : "unpaid"}
                  </button>
                  <div className="flex gap-2">
                    {tutor.status === "pending" && (
                      <button
                        onClick={() => handleApprove(tutor.id)}
                        className="rounded-full bg-ink text-paper px-3 py-1 text-xs"
                      >
                        Approve
                      </button>
                    )}
                    {tutor.status !== "rejected" && (
                      <button
                        onClick={() => handleReject(tutor.id)}
                        className="rounded-full border border-stone px-3 py-1 text-xs text-slate"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
