import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;

  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/no-access";


  // Allow Next internals
  if (nextUrl.pathname.startsWith("/_next") || nextUrl.pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Allow auth + login
  if (isAuthRoute || isPublicRoute) return NextResponse.next();

  // Require login for everything else
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/:path*"],
};
