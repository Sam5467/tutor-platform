import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildDecisionEmail, type Decision } from "@/lib/decision-email";

// Sends the "approved" / "not approved" / "removed" email to a tutor.
// Only admins can call it, and the decision is read from the database, not
// trusted from the request. If sending fails (for example the daily email
// limit is reached), the admin page asks the admin to message on WhatsApp.
export async function POST(request: Request) {
  const fail = (reason: string, status = 200) =>
    NextResponse.json({ sent: false, reason }, { status });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return fail("Email sending isn't set up yet.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not logged in.", 401);

  const { data: me } = await supabase
    .from("students")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin) return fail("Only admins can do this.", 403);

  const body = await request.json().catch(() => null);
  const tutorId = typeof body?.tutorId === "string" ? body.tutorId : null;
  if (!tutorId) return fail("Missing tutor.", 400);

  const { data: tutor } = await supabase
    .from("tutors")
    .select("id, full_name, status, paid_until")
    .eq("id", tutorId)
    .maybeSingle();
  if (!tutor || tutor.status === "pending") return fail("Nothing to tell this tutor.");

  // "Unlist" is a rejection of a tutor who was approved before.
  const decision: Decision =
    tutor.status === "approved"
      ? "approved"
      : body?.wasApproved
        ? "unlisted"
        : "rejected";

  const { data: email } = await supabase.rpc("get_tutor_email", {
    p_tutor_id: tutorId,
  });
  if (!email) return fail("We couldn't find this tutor's email.");

  const { data: settings } = await supabase
    .from("site_settings")
    .select("students_open")
    .maybeSingle();

  const message = buildDecisionEmail({
    decision,
    firstName: (tutor.full_name ?? "").split(" ")[0],
    tutorId,
    studentsOpen: !!settings?.students_open,
    paidUntil: tutor.paid_until,
    reason:
      decision !== "approved" && typeof body?.reason === "string"
        ? body.reason.trim().slice(0, 500)
        : undefined,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Passalong <noreply@passalonglb.com>",
        to: [email],
        reply_to: "passalonglb@gmail.com",
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
      return fail(
        res.status === 429
          ? "The daily email limit was reached."
          : "The email service refused the message."
      );
    }
  } catch (err) {
    console.error("Resend request failed", err);
    return fail("The email service couldn't be reached.");
  }

  return NextResponse.json({ sent: true, decision });
}
