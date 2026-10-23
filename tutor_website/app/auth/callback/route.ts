import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for links in emails (password reset now, email confirmation
// later). Supabase sends the user here with a one-time code, which we swap
// for a real login session before sending them on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Only follow "next" if it's a path on this site ("/..." but not "//...").
  const next = searchParams.get("next");
  const safeNext = next && /^\/(?!\/)/.test(next) ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin));
    }

    // A code means Supabase already checked the link. The swap fails when the
    // link is opened in another browser or app (e.g. the Gmail app) than the
    // one used to sign up. For a sign-up the email is confirmed anyway, so
    // just ask them to log in.
    if (safeNext !== "/reset-password") {
      return NextResponse.redirect(new URL("/login?confirmed=1", origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", origin));
}
