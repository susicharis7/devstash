import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const SIGNED_OUT_ONLY = new Set(["/", "/sign-in", "/register"]);

export const proxy = auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const signedIn = Boolean(req.auth);

  if (SIGNED_OUT_ONLY.has(pathname)) {
    return signedIn
      ? NextResponse.redirect(new URL("/dashboard", origin), 303)
      : NextResponse.next();
  }

  if (signedIn) return NextResponse.next();

  const signInUrl = new URL("/sign-in", origin);
  signInUrl.searchParams.set("callbackUrl", pathname);

  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/register",
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
  ],
};
