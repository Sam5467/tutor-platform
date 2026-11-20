// The two "can you also help with..." questions, used on the apply form and
// when editing a listing.
type HelpOptionsProps = {
  projects: boolean;
  thesis: boolean;
  onProjectsChange: (value: boolean) => void;
  onThesisChange: (value: boolean) => void;
};

export function HelpOptions({
  projects,
  thesis,
  onProjectsChange,
  onThesisChange,
}: HelpOptionsProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm text-slate mb-1">
        Can you also help with these? (optional)
      </legend>
      <label className="flex items-center gap-3 text-ink">
        <input
          type="checkbox"
          checked={projects}
          onChange={(e) => onProjectsChange(e.target.checked)}
          className="w-4 h-4 accent-[var(--color-brass)]"
        />
        Projects
      </label>
      <label className="flex items-center gap-3 text-ink">
        <input
          type="checkbox"
          checked={thesis}
          onChange={(e) => onThesisChange(e.target.checked)}
          className="w-4 h-4 accent-[var(--color-brass)]"
        />
        Thesis
      </label>
    </fieldset>
  );
}
