export const metadata = {
  title: "About",
  description:
    "Passalong connects senior university students in Lebanon who already passed a course with students who need help with it. Every tutor is checked by hand.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-6">About</h1>
      <p className="text-ink mb-4">
        Passalong connects senior university students who have already passed a
        course with newer students who need help with it. Students can
        browse and contact tutors for free.
      </p>
      <p className="text-ink">
        Every tutor listing is manually reviewed, including GPA and
        transcript verification, before it goes live.
      </p>
      <p className="text-slate text-sm mt-4">
        Passalong is independent and is not affiliated with any university.
      </p>
    </div>
  );
}
