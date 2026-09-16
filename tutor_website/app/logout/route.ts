import { NextResponse } from "next/server";

// TODO: replace with real Auth.js sign-out once sessions exist.
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("usek_logged_in", "", { path: "/", maxAge: 0 });
  return response;
}
