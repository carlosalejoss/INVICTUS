import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// "/partidos" is intentionally NOT protected: a "no jugador" (anonymous visitor) can view a match's
// details and availability lists, they just can't mark themselves available (that's login-gated at
// the action level, see setAvailability in panel/partidos/actions.ts).
const PROTECTED_PREFIXES = ["/panel", "/entrenamientos", "/cuenta"];

export default auth((req) => {
  const isProtected = PROTECTED_PREFIXES.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/panel/:path*", "/entrenamientos/:path*", "/cuenta/:path*"],
};
