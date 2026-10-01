"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/turnstile";

export default function StudentSignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // True when Supabase has "Confirm email" switched on: the account exists but
  // the person must click the link we emailed before they can log in.
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (TURNSTILE_ENABLED && !captchaToken) {
      setError("Please complete the check below first.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        captchaToken: captchaToken ?? undefined,
      },
    });

    setLoading(false);

    if (signUpError) {
      // Each check can only be used once, so ask for a fresh one.
      setCaptchaReset((c) => c + 1);
      setError(
        signUpError.code === "captcha_failed"
          ? "The human check failed. Please try again."
          : signUpError.message
      );
      return;
    }

    setNeedsConfirmation(!data.session);
    setSubmitted(true);
  };

  if (submitted && needsConfirmation) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">
          Check your email
        </h1>
        <p className="text-slate">
          We've sent a confirmation link to{" "}
          <span className="text-ink">{email}</span>. Click it to activate your
          account, then log in. It may take a minute, and it's worth checking
          your spam folder.
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium"
        >
          Go to log in
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">
          Account created!
        </h1>
        <p className="text-slate">
          You can now browse tutors and start contacting them.
        </p>
        <button
          onClick={() => router.push("/tutors")}
          className="inline-block mt-6 rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium"
        >
          Find a tutor
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-8 text-center">
        Create your student account
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-slate">First name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-stone rounded-lg py-2 px-4 text-ink"
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-slate">Last name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-stone rounded-lg py-2 px-4 text-ink"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Confirm password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <Turnstile onToken={setCaptchaToken} resetCount={captchaReset} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium mt-2 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-sm text-slate text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-brass underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
