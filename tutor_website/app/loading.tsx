import { Skeleton } from "@/components/skeleton";

// Home page (and any page without its own loading screen).
export default function Loading() {
  return (
    <div>
      <span className="sr-only">Loading…</span>
      <div className="flex min-h-[70vh] w-full items-center justify-center bg-ink px-4">
        <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
          <div className="animate-pulse rounded-md bg-paper/10 h-12 sm:h-16 w-4/5" />
          <div className="animate-pulse rounded-md bg-paper/10 h-12 sm:h-16 w-3/5" />
          <div className="animate-pulse rounded-md bg-paper/10 h-5 w-2/3 mt-4" />
          <div className="animate-pulse rounded-full bg-paper/10 h-12 w-44 mt-4" />
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-24">
        <Skeleton className="h-9 w-80 max-w-full mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
