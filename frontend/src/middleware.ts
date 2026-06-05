import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

const intlMiddleware = createMiddleware({
  locales: ["en", "am"],
  defaultLocale: "en",
  localePrefix: "never",
});

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Skip intl middleware for admin and API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // - … admin routes which we handle manually
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
    '/admin/:path*'
  ],
};
