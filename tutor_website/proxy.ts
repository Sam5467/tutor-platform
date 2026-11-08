import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TEST_MODE } from "@/lib/test-mode";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session if it's expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Browsing tutors is open to everyone; only applying needs an account.
  // Test mode (and locally): no login needed. Logged-out visitors can try
  // the apply form, but nothing they submit is saved.
  const loginFree = process.env.NODE_ENV === "development" || TEST_MODE;

  if (!user && !loginFree) {
    // Most people arriving here (e.g. from an ad) don't have an account yet,
    // so send them to sign up; the sign-up page links to log in for the rest.
    const signupUrl = new URL("/signup", request.url);
    signupUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signupUrl);
  }

  return response;
}

export const config = {
  matcher: ["/become-a-tutor"],
};
