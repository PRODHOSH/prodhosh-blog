import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: "/admin/:path*",
};
