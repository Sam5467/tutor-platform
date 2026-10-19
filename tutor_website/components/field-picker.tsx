import { fields } from "@/lib/fields";
import { Footer } from "@/components/footer";
import { GraduationCap } from "lucide-react";

type FieldPickerProps = {
  onSelect: (field: string) => void;
};

export function FieldPicker({ onSelect }: FieldPickerProps) {
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
          <p className="text-slate text-sm text-center mb-2">Step 1 of 2</p>
          <h1 className="font-display text-2xl text-ink text-center mb-8">
            Which field is your course in?
          </h1>
          <div className="flex flex-col gap-3">
            {fields.map((field) => (
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
            Don&apos;t worry — you can always go back and change this.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
