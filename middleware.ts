import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/((?!api/|_next/|og|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (req.nextUrl.pathname.endsWith(".png")) {
    return NextResponse.next();
  }

  const dashboardRegex = /^\/dashboard\/[a-z]{7}$/;

  // Redirect /dashboard/:id to /dashboard/:id/content immediately before the login check
  if (dashboardRegex.test(url.pathname)) {
    return NextResponse.redirect(new URL(`${url.pathname}/content`, req.url));
  }

  if (
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/login")
  ) {
    const session = await getToken({ req });

    if (!session && !url.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL(`/login`, req.url));
    } else if (session && url.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL(`/dashboard`, req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`/home${req.nextUrl.pathname}`, req.url));
}
