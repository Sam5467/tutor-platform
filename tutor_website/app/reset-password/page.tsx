"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // The link in the email logs the person in for a moment; if there's no
  // session here, the link was already used or has expired.
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasSession(!!user);
      setReady(true);
    }
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    router.refresh();
  };

  if (!ready) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <p className="text-slate">Loading...</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">
          This link has expired
        </h1>
        <p className="text-slate mb-6">
          Reset links can only be used once and don't last long. Please request
          a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">
          Password updated
        </h1>
        <p className="text-slate mb-6">
          Your password has been changed and you're logged in.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium"
        >
          Go to the home page
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-8 text-center">
        Choose a new password
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="new-password" className="text-sm text-slate">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirm-new-password" className="text-sm text-slate">
            Confirm new password
          </label>
          <input
            id="confirm-new-password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save new password"}
        </button>
      </form>
    </div>
  );
}
