// Passalong's Instagram: the icon, and the "follow us" line shown after
// applying or signing up.
export const INSTAGRAM_HANDLE = "passalonglb";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function FollowInstagram({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-slate ${className}`}>
      Don&apos;t forget to follow us on Instagram to stay updated!{" "}
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-brass font-medium underline"
      >
        <InstagramIcon size={15} />@{INSTAGRAM_HANDLE}
      </a>
    </p>
  );
}
