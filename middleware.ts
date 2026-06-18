import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin-only: dashboard
    if (pathname.startsWith("/dashboard")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
      }
    }

    // Premium content: requires PREMIUM plan or ADMIN
    const premiumPaths = ["/coloring", "/stories", "/games", "/printables"];
    if (premiumPaths.some((p) => pathname.startsWith(p))) {
      if (token?.plan !== "PREMIUM" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unlock", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        // Public paths — always allow
        const publicPaths = ["/", "/login", "/register", "/api/auth", "/api/setup", "/api/webhook"];
        if (publicPaths.some((p) => pathname.startsWith(p))) return true;
        // Everything else requires a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/coloring/:path*",
    "/stories/:path*",
    "/games/:path*",
    "/printables/:path*",
    "/login",
    "/register",
  ],
};
