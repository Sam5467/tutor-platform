export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="font-display text-3xl md:text-4xl text-ink mb-12 max-w-md">
        Three steps between you and a course you understand.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-stone border border-ink/15 rounded-lg overflow-hidden">
        <div className="bg-paper p-8 flex flex-col gap-3">
          <span className="font-display text-2xl text-brass">Search</span>
          <p className="text-slate leading-relaxed">
            Find senior students who've already taken and understood your
            exact course.
          </p>
        </div>
        <div className="bg-paper p-8 flex flex-col gap-3">
          <span className="font-display text-2xl text-brass">Contact</span>
          <p className="text-slate leading-relaxed">
            Reach out directly - no middleman, no waiting for a match.
          </p>
        </div>
        <div className="bg-paper p-8 flex flex-col gap-3">
          <span className="font-display text-2xl text-brass">Learn</span>
          <p className="text-slate leading-relaxed">
            Work through the material with someone who's already passed it.
          </p>
        </div>
      </div>
    </section>
  );
}
