import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Next.js 16 renamed the "middleware" convention to "proxy"; this file guards
// role-based access to /manager and /member routes.
export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;
    const isManager = role === "MANAGER" || role === "ADMIN";

    if (pathname.startsWith("/manager") && !isManager) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/manager/approvals") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/member") && role !== "TEAM_MEMBER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/login" },
  },
);

export const config = {
  matcher: ["/member/:path*", "/manager/:path*"],
};