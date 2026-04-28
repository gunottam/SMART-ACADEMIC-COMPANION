import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = (token?.role as string) || "student";

    if (pathname === "/dashboard") {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/dashboard/admin" : `/dashboard/${role}`, req.url)
      );
    }

    if (pathname === "/portal" && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (
      pathname.startsWith("/dashboard/teacher") &&
      role !== "teacher" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (
      pathname.startsWith("/dashboard/student") &&
      role !== "student" &&
      role !== "admin" &&
      role !== "teacher"
    ) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/portal"],
};
