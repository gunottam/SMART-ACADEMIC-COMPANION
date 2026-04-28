import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import AmbientBackground from "@/components/ui/AmbientBackground";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAC — Smart Academic Companion",
  description:
    "An intelligent tutoring system that adapts to your learning style and helps you master your curriculum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen text-slate-900 relative overflow-x-hidden">
        <AmbientBackground />
        <div className="relative z-10 min-h-screen">
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
