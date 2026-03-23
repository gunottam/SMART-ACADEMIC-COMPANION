import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Mock Login (Dev)",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "student@geu.ac.in" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        await dbConnect();
        
        let user = await User.findOne({ email: String(credentials.email) });

        if (!user) {
          user = await User.create({
            name: "Mock Admin",
            email: credentials.email,
            role: "admin"
          });
        } else if (user.role !== "admin") {
          user.role = "admin";
          await user.save();
        }
        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role } as any;
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") return true;
      if (account?.provider === "azure-ad" || account?.provider === "google") {
        const userEmail = user.email as string;
        
        // Define your master admin emails here
        // This will bypass the @geu.ac.in constraint and grant "admin" role
        const ADMIN_EMAILS = ["gunottammaini@gmail.com"]; 
        const isAdmin = ADMIN_EMAILS.includes(userEmail);

        // Critical Authorization Rule
        if (!userEmail?.endsWith("@geu.ac.in") && !isAdmin) {
          return false;
        }

        await dbConnect();

        // Check if user exists in the database
        const existingUser = await User.findOne({ email: userEmail });

        if (!existingUser) {
          // Create a new user if they don't exist
          await User.create({
            name: user.name,
            email: userEmail,
            image: user.image,
            role: isAdmin ? "admin" : "student", // assign admin role
          });
        } else if (isAdmin && existingUser.role !== "admin") {
          // Auto-upgrade user to admin if they were added to the array later
          existingUser.role = "admin";
          await existingUser.save();
        }
        
        return true;
      }
      return false;
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        const sessionEmail = session.user.email;
        await dbConnect();
        const dbUser = await User.findOne({ email: String(sessionEmail) });

        if (dbUser) {
          (session.user as any).id = dbUser._id.toString();
          (session.user as any).role = dbUser.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
