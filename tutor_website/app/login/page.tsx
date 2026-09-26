"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Incorrect email or password.");
      return;
    }

    router.push(searchParams.get("next") ?? "/tutors");
    router.refresh();
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
          disabled={loading}
          className="rounded-full bg-ink text-paper px-8 py-3 text-sm font-medium mt-2 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
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
