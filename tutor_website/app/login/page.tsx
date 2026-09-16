"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // TODO: replace with real Auth.js (NextAuth) credentials sign-in once
    // the database is wired up. For now, any submitted credentials are
    // accepted and a mock session cookie is set.
    console.log("Login attempted:", { email });
    document.cookie = `usek_logged_in=true; path=/; max-age=${60 * 60 * 24 * 7}`;
    router.push(searchParams.get("next") ?? "/tutors");
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-8 text-center">
        Log in
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-stone rounded-lg py-2 px-4 text-ink"
          />
        </div>

        {error && <p className="text-sm text-slate">{error}</p>}

        <button
          type="submit"
          className="rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium mt-2"
        >
          Log in
        </button>

        <p className="text-sm text-slate text-center">
          Don't have an account?{" "}
          <Link href="/signup" className="text-brass underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
