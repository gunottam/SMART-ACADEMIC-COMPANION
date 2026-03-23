import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protects /dashboard and all sub-routes
  matcher: ["/dashboard/:path*"],
};
