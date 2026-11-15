// Sends one email through Resend (the same service as the sign-up emails).
// Replies go to the project Gmail. Returns a reason when it couldn't send,
// e.g. because the daily email limit is reached.
export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "Email sending isn't set up yet." };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Passalong <noreply@passalonglb.com>",
        to: [message.to],
        reply_to: "passalonglb@gmail.com",
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
      return {
        sent: false,
        reason:
          res.status === 429
            ? "The daily email limit was reached."
            : "The email service refused the message.",
      };
    }
  } catch (err) {
    console.error("Resend request failed", err);
    return { sent: false, reason: "The email service couldn't be reached." };
  }
  return { sent: true };
}
