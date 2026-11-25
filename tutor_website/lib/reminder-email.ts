// The email sent to someone who created an account to become a tutor but
// never sent their application.
import {
  CONTACT_EMAIL,
  SITE_URL,
  renderEmail,
  type EmailLine,
} from "@/lib/decision-email";

export function buildReminderEmail(
  firstName: string,
  // From the site settings: whether students can browse, and until when
  // listings are free.
  site: { studentsOpen: boolean; freeUntil: string | null }
) {
  const freeUntil =
    site.freeUntil && new Date(site.freeUntil) > new Date()
      ? new Date(site.freeUntil).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Beirut",
        })
      : null;

  const openLine: EmailLine[] = site.studentsOpen
    ? [
        {
          highlight: `Passalong is now open to students, and they're already looking for tutors!${
            freeUntil ? ` Your listing is free until ${freeUntil}.` : ""
          }`,
        },
      ]
    : [];

  const lines: EmailLine[] = [
    "You created a Passalong account to become a tutor, but your application isn't finished yet.",
    ...openLine,
    "It only takes about 3 minutes. Have your transcript ready (a PDF or a clear photo): it must show your GPA.",
    "Once you're approved, students who need help in the courses you passed will find your tutor card. You set your price and your schedule.",
    `If something stopped you or didn't work, write to us at ${CONTACT_EMAIL} and we'll help.`,
  ];
  return {
    subject: site.studentsOpen
      ? "We're open! Finish your Passalong tutor application"
      : "Finish your Passalong tutor application",
    ...renderEmail(firstName || "there", lines, {
      label: "Finish my application",
      url: `${SITE_URL}/become-a-tutor`,
    }),
  };
}
