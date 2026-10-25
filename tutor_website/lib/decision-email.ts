// The emails a tutor gets when an admin approves, rejects or unlists them.
import { MONTHLY_FEE } from "@/lib/listing-fee";

const CONTACT_EMAIL = "passalonglb@gmail.com";
const SITE_URL = "https://www.passalonglb.com";

export type Decision = "approved" | "rejected" | "unlisted";

type EmailInput = {
  decision: Decision;
  firstName: string;
  tutorId: string;
  studentsOpen: boolean;
  paidUntil: string | null;
  // Typed by the admin when rejecting.
  reason?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// What an approved tutor needs to know about the free period and the fee.
function approvedLines({ studentsOpen, paidUntil }: EmailInput): string[] {
  const fee = `After that, your listing costs $${MONTHLY_FEE} per month to stay visible to students. You pay us directly, not through the website, and we'll contact you before it's due.`;

  if (!studentsOpen) {
    return [
      "Passalong isn't open to students yet. Your free month does not start now: it starts on the day we open the site to students, and lasts 30 days.",
      fee,
    ];
  }
  if (paidUntil && new Date(paidUntil) > new Date()) {
    return [
      `Your listing is live now, and it's free until ${formatDate(paidUntil)}.`,
      fee,
    ];
  }
  return [
    `To go live, your listing costs $${MONTHLY_FEE} per month. You pay us directly, not through the website. We'll contact you soon to arrange it.`,
  ];
}

export function buildDecisionEmail(input: EmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const name = input.firstName || "there";
  let subject: string;
  let lines: string[];
  let button: { label: string; url: string } | null = null;

  if (input.decision === "approved") {
    subject = "You're approved as a tutor on Passalong";
    lines = [
      "Good news: your tutor application has been approved.",
      ...approvedLines(input),
      "You can see your tutor card and edit your courses, price and bio at any time.",
    ];
    button = { label: "See my tutor card", url: `${SITE_URL}/tutors/${input.tutorId}` };
  } else if (input.decision === "unlisted") {
    subject = "Your Passalong listing has been removed";
    lines = [
      "Your tutor listing has been removed from Passalong, so students can no longer see it.",
      `If you think this is a mistake, write to us at ${CONTACT_EMAIL}.`,
    ];
  } else {
    subject = "About your Passalong tutor application";
    lines = [
      "Thank you for applying to tutor on Passalong. Unfortunately, we couldn't approve your application.",
      ...(input.reason ? [`Reason: ${input.reason}`] : []),
      `If you think this is a mistake, write to us at ${CONTACT_EMAIL}.`,
    ];
  }

  const text = [
    `Hi ${name},`,
    "",
    ...lines.flatMap((l) => [l, ""]),
    ...(button ? [`${button.label}: ${button.url}`, ""] : []),
    "The Passalong team",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F6F2;font-family:Arial,Helvetica,sans-serif;color:#12213D;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <p style="font-size:22px;font-weight:bold;margin:0 0 24px;">Pass<span style="color:#B08D57;">along</span></p>
    <p style="font-size:16px;margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    ${lines
      .map(
        (l) =>
          `<p style="font-size:15px;line-height:1.55;margin:0 0 14px;">${escapeHtml(l)}</p>`
      )
      .join("\n    ")}
    ${
      button
        ? `<p style="margin:24px 0;"><a href="${button.url}" style="display:inline-block;background:#12213D;color:#F7F6F2;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;">${escapeHtml(button.label)}</a></p>`
        : ""
    }
    <p style="font-size:15px;margin:24px 0 0;">The Passalong team</p>
  </div>
</body></html>`;

  return { subject, html, text };
}
