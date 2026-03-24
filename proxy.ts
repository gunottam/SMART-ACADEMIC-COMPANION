import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = (token.role as string) || "student";

    // Dynamic role-based routing
    if (path === "/portal" || path === "/dashboard") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    // Role authorization for specific sub-routes
    if (path.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (path.startsWith("/dashboard/teacher") && role !== "teacher" && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (path.startsWith("/dashboard/student") && role !== "student" && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) return false;
        
        const email = token.email as string;
        const ADMIN_EMAILS = ["gunottammaini@gmail.com"]; 
        const isAdmin = ADMIN_EMAILS.includes(email) || token.role === "admin";

        // Enforce university domain strictness at middleware level
        if (!email?.endsWith("@geu.ac.in") && !isAdmin) {
          return false;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // Protect central paths
  matcher: ["/dashboard/:path*", "/portal"],
};
