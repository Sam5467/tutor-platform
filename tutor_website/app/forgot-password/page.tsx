"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` }
    );

    setLoading(false);

    if (resetError) {
      setError(
        resetError.status === 429
          ? "Too many requests. Please wait a few minutes and try again."
          : "We couldn't send the email. Please try again later."
      );
      return;
    }

    // Same message whether or not the email has an account, so nobody can
    // use this page to find out who is registered.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">
          Check your email
        </h1>
        <p className="text-slate mb-6">
          If an account exists for <span className="text-ink">{email}</span>,
          we've sent a link to reset your password. It may take a minute, and
          it's worth checking your spam folder.
        </p>
        <Link href="/login" className="text-brass underline text-sm">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-2 text-center">
        Forgot your password?
      </h1>
      <p className="text-sm text-slate text-center mb-8">
        Enter your email and we'll send you a link to choose a new one.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="forgot-email" className="text-sm text-slate">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <p className="text-sm text-slate text-center">
          <Link href="/login" className="text-brass underline">
            Back to log in
          </Link>
        </p>
      </form>
    </div>
  );
}
