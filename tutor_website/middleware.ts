import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO: replace this cookie check with a real Auth.js session check
// once the database and NextAuth are wired up.
export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("usek_logged_in")?.value === "true";

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tutors", "/tutors/:path*", "/become-a-tutor"],
};
