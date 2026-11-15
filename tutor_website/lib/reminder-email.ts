// The email sent to someone who created an account to become a tutor but
// never sent their application.
import { CONTACT_EMAIL, SITE_URL, renderEmail } from "@/lib/decision-email";

export function buildReminderEmail(firstName: string) {
  const lines = [
    "You created a Passalong account to become a tutor, but your application isn't finished yet.",
    "It only takes about 3 minutes. Have your transcript ready (a PDF or a clear photo): it must show your GPA.",
    "Once you're approved, students who need help in the courses you passed will find your tutor card. You set your price and your schedule.",
    `If something stopped you or didn't work, write to us at ${CONTACT_EMAIL} and we'll help.`,
  ];
  return {
    subject: "Finish your Passalong tutor application",
    ...renderEmail(firstName || "there", lines, {
      label: "Finish my application",
      url: `${SITE_URL}/become-a-tutor`,
    }),
  };
}
