import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Landing point for email links that carry a token_hash (set in the Supabase
// email templates). Unlike /auth/callback, this works even when the link is
// opened in a different browser or app than the one used to sign up.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Only follow "next" if it's a path on this site ("/..." but not "//...").
  const next = searchParams.get("next");
  const safeNext = next && /^\/(?!\/)/.test(next) ? next : "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", origin));
}
