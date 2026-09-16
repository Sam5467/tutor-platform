"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HeaderShellProps = {
  isLoggedIn: boolean;
};

export function HeaderShell({ isLoggedIn }: HeaderShellProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 border-b ${
        isLanding ? "border-stone" : "bg-ink border-ink/20"
      }`}
    >
      <Link
        href="/"
        className={`font-display text-lg ${isLanding ? "text-ink" : "text-paper"}`}
      >
        USEK Tutors
      </Link>

      <nav
        className={`flex items-center gap-6 text-sm ${
          isLanding ? "text-ink" : "text-paper"
        }`}
      >
        <Link href="/tutors">Find a tutor</Link>
        <Link href="/become-a-tutor">Become a tutor</Link>
        {isLoggedIn ? (
          <Link href="/logout">Log out</Link>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link
              href="/signup"
              className={`rounded-full px-4 py-2 ${
                isLanding ? "bg-ink text-paper" : "bg-brass text-ink"
              }`}
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
