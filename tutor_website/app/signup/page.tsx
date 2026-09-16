"use client";

import { useState } from "react";
import Link from "next/link";

export default function StudentSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    // TODO: replace with real Auth.js (NextAuth) credentials signup once
    // the database is wired up. Should hash the password server-side and
    // create a Student record, then establish a session.
    console.log("Student signup submitted:", { name, email });
    document.cookie = `usek_logged_in=true; path=/; max-age=${60 * 60 * 24 * 7}`;

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h1 className="font-display text-2xl text-ink mb-4">
          Account created!
        </h1>
        <p className="text-slate">
          You can now browse tutors and start contacting them.
        </p>
        <Link
          href="/tutors"
          className="inline-block mt-6 rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium"
        >
          Find a tutor
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-8 text-center">
        Create your student account
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium mt-2"
        >
          Create account
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
