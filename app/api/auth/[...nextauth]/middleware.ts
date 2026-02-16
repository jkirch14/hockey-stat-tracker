import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  // Allow auth routes
  if (isAuthRoute) return NextResponse.next();

  // If not logged in, redirect to sign-in
  if (!isLoggedIn) {
    const loginUrl = new URL("/api/auth/signin", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
