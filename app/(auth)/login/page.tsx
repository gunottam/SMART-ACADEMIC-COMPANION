"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/portal");
    } else {
      alert("Invalid credentials. Try student@geu.ac.in as requested.");
    }
  };
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* ── Background orbs ──────────────────────── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-500/[0.05] blur-[100px] rounded-full -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <Link
          href="/"
          className="block text-center text-2xl font-semibold tracking-tight text-neutral-50 mb-10"
        >
          SAC<span className="text-indigo-400">.</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8">
          <h1 className="text-2xl font-semibold text-neutral-50 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-400 mb-8">
            Enter your university credentials to continue.
          </p>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 0.99 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => signIn("azure-ad", { callbackUrl: "/portal" })}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-200 py-3 px-4 text-sm font-medium text-neutral-200"
            >
              {/* Microsoft icon */}
              <svg className="w-5 h-5" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              Continue with Microsoft
            </motion.button>
            <motion.button
              whileHover={{ scale: 0.99 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => signIn("google", { callbackUrl: "/portal" })}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-200 py-3 px-4 text-sm font-medium text-neutral-200"
            >
              {/* Google icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-neutral-500">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Email field */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-neutral-400 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@geu.ac.in"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20 transition-all duration-200"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-neutral-400 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20 transition-all duration-200"
              />
            </div>
            <motion.button
              disabled={loading}
              whileHover={{ scale: 0.99 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="w-full flex justify-center items-center rounded-lg bg-white text-black text-sm font-medium py-2.5 hover:bg-neutral-200 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
            </motion.button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-neutral-500 text-center leading-relaxed">
          Access strictly limited to authorized{" "}
          <span className="text-neutral-400">@geu.ac.in</span> domains.
        </p>
      </motion.div>
    </div>
  );
}
