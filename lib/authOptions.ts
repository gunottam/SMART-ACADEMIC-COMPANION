import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User, { UserRole } from "@/models/User";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "geu.ac.in";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function isDomainAllowed(email?: string | null): boolean {
  if (!email) return false;
  if (isAdminEmail(email)) return true;
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.AZURE_AD_CLIENT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
            tenantId: process.env.AZURE_AD_TENANT_ID || "",
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        if (!isDomainAllowed(email)) return null;

        await dbConnect();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );
        if (!ok) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        } as { id: string; email: string; name?: string; role: UserRole; image?: string };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      const email = (user.email || "").toLowerCase();
      if (!isDomainAllowed(email)) return false;

      const admin = isAdminEmail(email);
      await dbConnect();
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({
          name: user.name || email.split("@")[0],
          email,
          image: user.image || undefined,
          role: admin ? "admin" : "student",
        });
      } else if (admin && existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: UserRole }).role || "student";
        return token;
      }

      if (trigger === "signIn" || !token.role || !token.id) {
        if (token.email) {
          await dbConnect();
          const dbUser = await User.findOne({ email: String(token.email).toLowerCase() });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.picture = token.picture || dbUser.image;
            token.name = token.name || dbUser.name;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.role = (token.role as UserRole) || "student";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
};
