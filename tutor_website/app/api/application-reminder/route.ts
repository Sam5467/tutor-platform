import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildReminderEmail } from "@/lib/reminder-email";
import { sendEmail } from "@/lib/send-email";

// Reminds someone who signed up to become a tutor that their application isn't
// finished. Only admins can call it, and only for people who are still on the
// "signed up but didn't apply" list with a confirmed email.
export async function POST(request: Request) {
  const fail = (reason: string, status = 200) =>
    NextResponse.json({ sent: false, reason }, { status });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not logged in.", 401);

  const body = await request.json().catch(() => null);
  const studentId = typeof body?.studentId === "string" ? body.studentId : null;
  if (!studentId) return fail("Missing person.", 400);

  // Also checks that the caller is an admin.
  const { data: rows, error } = await supabase.rpc("admin_unfinished_applicants");
  if (error) return fail("Only admins can do this.", 403);

  const person = (rows ?? []).find(
    (r: { student_id: string }) => r.student_id === studentId
  );
  if (!person) return fail("They've already applied, or they're not on the list.");
  if (!person.confirmed) return fail("They haven't confirmed their email yet.");

  const message = buildReminderEmail((person.full_name ?? "").split(" ")[0]);
  const result = await sendEmail({ to: person.email, ...message });
  if (!result.sent) return fail(result.reason);

  await supabase.rpc("admin_mark_reminded", {
    p_student_id: studentId,
  });

  return NextResponse.json({ sent: true, remindedAt: new Date().toISOString() });
}
