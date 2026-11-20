import { fields } from "@/lib/fields";
import { Footer } from "@/components/footer";
import { GraduationCap } from "lucide-react";

type FieldPickerProps = {
  onSelect: (field: string) => void;
  // Only show these fields (the ones that have tutors). All when not given.
  available?: Set<string>;
  // Whether picking a major comes next.
  twoSteps?: boolean;
};

export function FieldPicker({
  onSelect,
  available,
  twoSteps = true,
}: FieldPickerProps) {
  const shown =
    available && available.size > 0
      ? fields.filter((f) => available.has(f.name))
      : fields;

  return (
    <div>
      <div className="relative max-w-5xl mx-auto py-10 sm:py-16 px-4">
        <GraduationCap
          className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 text-stone"
          size={140}
          strokeWidth={1}
        />
        <GraduationCap
          className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 text-stone"
          size={140}
          strokeWidth={1}
        />

        <div className="max-w-xl mx-auto">
          {twoSteps && (
            <p className="text-slate text-sm text-center mb-2">Step 1 of 2</p>
          )}
          <h1 className="font-display text-2xl text-ink text-center mb-8">
            Which field is your course in?
          </h1>
          <div className="flex flex-col gap-3">
            {shown.map((field) => (
              <button
                key={field.name}
                onClick={() => onSelect(field.name)}
                className="rounded-full py-3 px-6 text-left font-medium border border-stone text-ink hover:border-brass transition-colors"
              >
                {field.name}
              </button>
            ))}
          </div>
          <p className="text-slate text-sm text-center mt-8">
            Don&apos;t worry, you can always go back and change this.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
