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

  // Test mode: anyone can look at tutors without logging in (applying
  // still needs an account). Locally, nothing needs a login.
  const isLookingAround = request.nextUrl.pathname.startsWith("/tutors");
  const loginFree =
    process.env.NODE_ENV === "development" || (TEST_MODE && isLookingAround);

  if (!user && !loginFree) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/tutors", "/tutors/:path*", "/become-a-tutor"],
};
