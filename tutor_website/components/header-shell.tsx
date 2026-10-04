"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type HeaderShellProps = {
  isLoggedIn: boolean;
  approvedTutorId?: string | null;
  userName?: string | null;
  showFindTutor?: boolean;
};

export function HeaderShell({
  isLoggedIn,
  approvedTutorId = null,
  userName = null,
  showFindTutor = true,
}: HeaderShellProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const textColor = isLanding ? "text-ink" : "text-paper";

  const navLinks = (
    <>
      {!approvedTutorId && showFindTutor && (
        <Link href="/tutors" onClick={() => setMenuOpen(false)}>
          Find a tutor
        </Link>
      )}
      {approvedTutorId ? (
        <Link
          href={`/tutors/${approvedTutorId}`}
          onClick={() => setMenuOpen(false)}
        >
          My tutor card
        </Link>
      ) : (
        <Link href="/become-a-tutor" onClick={() => setMenuOpen(false)}>
          Become a tutor
        </Link>
      )}
      {isLoggedIn ? (
        // Plain <a> on purpose: a full page load makes sure the header is
        // re-fetched. A <Link> would reuse the cached "/" page and keep
        // showing "Log out".
        <>
          {userName && (
            <span className="max-w-[10rem] truncate opacity-70">
              {userName}
            </span>
          )}
          <a href="/logout">Log out</a>
        </>
      ) : (
        <>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            className={`rounded-full px-4 py-2 ${
              isLanding ? "bg-ink text-paper" : "bg-brass text-ink"
            }`}
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header
      className={`relative flex items-center justify-between px-6 py-4 border-b ${
        isLanding ? "border-stone" : "bg-ink border-ink/20"
      }`}
    >
      <Link href="/" className={`font-display text-lg ${textColor}`}>
        USEK Tutors
      </Link>

      {/* Desktop nav */}
      <nav className={`hidden md:flex items-center gap-6 text-sm ${textColor}`}>
        {navLinks}
      </nav>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMenuOpen((open) => !open)}
        className={`md:hidden flex flex-col gap-1.5 p-2 ${textColor}`}
        aria-label="Toggle menu"
      >
        <span className="w-6 h-0.5 bg-current" />
        <span className="w-6 h-0.5 bg-current" />
        <span className="w-6 h-0.5 bg-current" />
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          className={`md:hidden absolute top-full left-0 right-0 flex flex-col gap-4 px-6 py-6 text-sm border-b z-50 ${
            isLanding
              ? "bg-paper text-ink border-stone"
              : "bg-ink text-paper border-ink/20"
          }`}
        >
          {navLinks}
        </nav>
      )}
    </header>
  );
}
