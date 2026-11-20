import { ProjectHelpButton } from "@/components/project-help-button";

export const metadata = {
  title: "Project and thesis help",
  description:
    "Working on a university project or your thesis in Lebanon? Message Passalong and we'll match you with a student who has already done one in your field.",
  alternates: { canonical: "/project-help" },
};

const STEPS = [
  {
    title: "Message us",
    text: "Tell us your subject, your university and your deadline.",
  },
  {
    title: "We find your tutor",
    text: "We match you with a student who has already done a project or thesis in your field.",
  },
  {
    title: "Get quality work",
    text: "They give you the best work for an affordable price.",
  },
];

export default function ProjectHelpPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="font-display text-3xl text-ink mb-4">
        Project and thesis help
      </h1>
      <p className="text-ink mb-10">
        Stuck on a project or your thesis? Tell us what you&apos;re working on,
        and we&apos;ll connect you with a student who has already been through
        it in your field.
      </p>

      <ol className="flex flex-col gap-6 mb-10">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="shrink-0 w-9 h-9 rounded-full bg-ink text-brass font-display flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <p className="font-display text-lg text-ink">{step.title}</p>
              <p className="text-slate text-sm">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-lg border border-brass p-6 text-center">
        <p className="text-ink mb-4">
          Message us on WhatsApp and we&apos;ll get back to you quickly.
        </p>
        <ProjectHelpButton />
        <p className="text-xs text-slate mt-3">+961 76 442 596</p>
      </div>
    </div>
  );
}
