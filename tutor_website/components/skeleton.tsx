// Grey placeholder shapes shown while a page or section is loading.

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-stone/60 ${className}`}
    />
  );
}

// Tells screen readers something is loading, without showing text.
function LoadingLabel() {
  return <span className="sr-only">Loading…</span>;
}

export function TutorCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg p-4 border border-stone">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-10 shrink-0" />
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <div className="pt-2.5 border-t border-stone flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function TutorGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="max-w-6xl mx-auto pt-6 pb-16 px-4">
      <LoadingLabel />
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-7 w-48 mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-3 max-w-md">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <Skeleton className="h-4 w-16 mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: count }, (_, i) => (
          <TutorCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// The "Which field?" list of rounded buttons.
export function PickerSkeleton({ withSearch = false }: { withSearch?: boolean }) {
  return (
    <div>
      <LoadingLabel />
      {withSearch && (
        <div className="max-w-xl mx-auto px-4 pt-6">
          <Skeleton className="h-12 rounded-full" />
        </div>
      )}
      <div className="max-w-xl mx-auto py-10 sm:py-16 px-4 flex flex-col items-center">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-7 w-72 max-w-full mb-8" />
        <div className="flex flex-col gap-3 w-full">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <LoadingLabel />
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 border-b border-stone pb-4">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <LoadingLabel />
      <Skeleton className="h-4 w-14 mb-6" />
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-6 w-48 max-w-full" />
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-4 w-32 max-w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-2 mb-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-3.5 w-28 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <ReviewsSkeleton />
        </div>
        <div className="sm:w-64 flex flex-col gap-6">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// A centered form: title and a column of fields.
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <LoadingLabel />
      <Skeleton className="h-7 w-48 mx-auto mb-8" />
      <div className="flex flex-col gap-5">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-10" />
          </div>
        ))}
        <Skeleton className="h-11 rounded-full mt-4" />
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <LoadingLabel />
      <Skeleton className="h-8 w-40 mb-8" />
      <Skeleton className="h-24 rounded-lg mb-8" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Plain text pages (About, Terms, Privacy, Contact…).
export function TextPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <LoadingLabel />
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}
