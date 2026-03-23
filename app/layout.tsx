import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { Ambient3DBackground } from "@/components/ui/Ambient3DBackground";
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
      <body className="min-h-screen bg-transparent text-neutral-50 relative overflow-x-hidden">
        <Ambient3DBackground />
        <div className="relative z-10 min-h-screen">
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </div>
      </body>
    </html>
  );
}

