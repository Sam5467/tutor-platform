// What a tutor is told about the free period and the monthly fee. It follows
// the admin switch: before opening, during the shared 30-day free period
// (which ends 30 days after the site opened to students), and after it.

export const MONTHLY_FEE = 10;
const FREE_DAYS = 30;

export type SiteState = {
  studentsOpen: boolean;
  studentsOpenedAt: string | null;
};

export function freePeriodEnd(state: SiteState): Date | null {
  if (!state.studentsOpen || !state.studentsOpenedAt) return null;
  const end = new Date(state.studentsOpenedAt);
  end.setDate(end.getDate() + FREE_DAYS);
  return end;
}

export function listingFeeMessage(state: SiteState): {
  title: string;
  lines: string[];
} {
  const payment = `When the free period ends, your listing costs $${MONTHLY_FEE} per month to stay visible to students. You pay us directly, not through the website, and we'll contact you before it's due.`;

  if (!state.studentsOpen) {
    return {
      title: "Your first month is free",
      lines: [
        "Your free month does not start now. It starts on the day we open Passalong to students, and lasts 30 days.",
        "Until then, your listing costs nothing while we get our first tutors ready.",
        payment,
      ],
    };
  }

  const end = freePeriodEnd(state);
  if (end && end > new Date()) {
    const date = end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return {
      title: `Free until ${date}`,
      lines: [
        `We just opened to students, so every tutor's listing is free until ${date}.`,
        payment,
      ],
    };
  }

  return {
    title: `$${MONTHLY_FEE} per month`,
    lines: [
      `Once you're approved, your listing costs $${MONTHLY_FEE} per month to stay visible to students.`,
      "You pay us directly, not through the website. We'll contact you after approval to arrange it.",
    ],
  };
}
