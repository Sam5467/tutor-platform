import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildDecisionEmail, type Decision } from "@/lib/decision-email";
import { sendEmail } from "@/lib/send-email";

// Sends the "approved" / "not approved" / "removed" email to a tutor.
// Only admins can call it, and the decision is read from the database, not
// trusted from the request. If sending fails (for example the daily email
// limit is reached), the admin page asks the admin to message on WhatsApp.
export async function POST(request: Request) {
  const fail = (reason: string, status = 200) =>
    NextResponse.json({ sent: false, reason }, { status });

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
    .select("id, slug, full_name, status, paid_until")
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
    .select("students_open, free_until")
    .maybeSingle();

  const message = buildDecisionEmail({
    decision,
    firstName: (tutor.full_name ?? "").split(" ")[0],
    tutorId,
    tutorSlug: tutor.slug,
    studentsOpen: !!settings?.students_open,
    freeUntil: settings?.free_until ?? null,
    paidUntil: tutor.paid_until,
    reason:
      decision !== "approved" && typeof body?.reason === "string"
        ? body.reason.trim().slice(0, 500)
        : undefined,
  });

  const result = await sendEmail({ to: email, ...message });
  if (!result.sent) return fail(result.reason);

  return NextResponse.json({ sent: true, decision });
}
