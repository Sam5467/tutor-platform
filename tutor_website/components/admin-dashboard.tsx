"use client";

import { useState, useMemo } from "react";
import { mockTutors, type Tutor } from "@/lib/mock-data";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";

export function AdminDashboard() {
  const [tutors, setTutors] = useState<Tutor[]>(mockTutors);

  const majorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tutors) {
      counts[t.major] = (counts[t.major] ?? 0) + 1;
    }
    return Object.entries(counts).map(([major, count]) => ({ major, count }));
  }, [tutors]);

  const handleApprove = (id: string) => {
    setTutors((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "approved" } : t))
    );
  };

  const handleReject = (id: string) => {
    setTutors((prev) => prev.filter((t) => t.id !== id));
  };

  const togglePayment = (id: string) => {
    setTutors((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              paymentStatus: t.paymentStatus === "paid" ? "unpaid" : "paid",
            }
          : t
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-2">Admin dashboard</h1>
      <p className="text-sm text-slate mb-10">
        Changes here are local only (no database yet) — refreshing resets
        everything back to the mock data.
      </p>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg text-ink mb-4">
            Manage tutors
          </h2>
          <div className="flex flex-col">
            <div className="grid grid-cols-5 gap-4 text-xs text-slate uppercase pb-2 border-b border-stone">
              <span>Name</span>
              <span>Major</span>
              <span>Status</span>
              <span>Payment</span>
              <span>Actions</span>
            </div>
            {tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="grid grid-cols-5 gap-4 items-center py-4 border-b border-stone text-sm"
              >
                <span className="text-ink">{tutor.name}</span>
                <span className="text-slate">{tutor.major}</span>
                <span
                  className={
                    tutor.status === "approved"
                      ? "text-green-700"
                      : "text-brass"
                  }
                >
                  {tutor.status}
                </span>
                <button
                  onClick={() => togglePayment(tutor.id)}
                  className={
                    tutor.paymentStatus === "paid"
                      ? "text-green-700 underline text-left"
                      : "text-red-600 underline text-left"
                  }
                >
                  {tutor.paymentStatus}
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
                  <button
                    onClick={() => handleReject(tutor.id)}
                    className="rounded-full border border-stone px-3 py-1 text-xs text-slate"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
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
