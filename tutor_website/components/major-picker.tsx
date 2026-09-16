import { faculties } from "@/lib/faculties";
import { Footer } from "@/components/footer";
import { BookOpen } from "lucide-react";

type MajorPickerProps = {
  faculty: string;
  onSelect: (major: string) => void;
  onBack: () => void;
};

export function MajorPicker({ faculty, onSelect, onBack }: MajorPickerProps) {
  const facultyData = faculties.find((f) => f.name === faculty);
  const majors = facultyData?.majors ?? [];

  return (
    <div>
      <div className="relative max-w-5xl mx-auto py-16 px-4">
        <BookOpen
          className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 text-stone"
          size={140}
          strokeWidth={1}
        />
        <BookOpen
          className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 text-stone"
          size={140}
          strokeWidth={1}
        />

        <div className="max-w-xl mx-auto">
          <button onClick={onBack} className="text-slate text-sm mb-6">
            ← Back to faculties
          </button>
          <p className="text-slate text-sm text-center mb-2">Step 2 of 3</p>
          <h1 className="font-display text-2xl text-ink text-center mb-8">
            Which major?
          </h1>
          <div className="flex flex-col gap-3">
            {majors.map((major) => (
              <button
                key={major}
                onClick={() => onSelect(major)}
                className="rounded-full py-3 px-6 text-left font-medium border border-stone text-ink hover:border-brass transition-colors"
              >
                {major}
              </button>
            ))}
          </div>
          <p className="text-slate text-sm text-center mt-8">
            Don&apos;t worry — you can always go back and change this.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
