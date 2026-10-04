import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto max-w-5xl px-6 py-12 mt-12 hairline-divider flex flex-col md:flex-row justify-between gap-4 text-sm text-slate">
      <p>Built by USEK students, for USEK students.</p>
      <div className="flex gap-6">
        <Link href="/about" className="hover:text-brass transition-colors">
          About
        </Link>
        <Link href="/terms" className="hover:text-brass transition-colors">
          Terms
        </Link>
        <Link href="/privacy" className="hover:text-brass transition-colors">
          Privacy
        </Link>
        <Link href="/contact" className="hover:text-brass transition-colors">
          Contact
        </Link>
      </div>
    </footer>
  );
}
