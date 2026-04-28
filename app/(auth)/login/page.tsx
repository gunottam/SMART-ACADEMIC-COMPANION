"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

type ProviderMap = Awaited<ReturnType<typeof getProviders>>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderMap | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "AccessDenied") {
      toast.error("This account is not allowed. Use your institution email.");
    } else if (error) {
      toast.error("Sign in failed. Please try again.");
    }
  }, [searchParams]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter both email and password.");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      toast.success("Signed in. Redirecting...");
      router.push("/portal");
      router.refresh();
    } else {
      toast.error("Invalid email or password.");
    }
  };

  const hasAzure = !!providers?.["azure-ad"];
  const hasGoogle = !!providers?.google;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2563EB]/15 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-sky-400/14 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Link
          href="/"
          className="block text-center text-2xl font-semibold tracking-tight text-[#2563EB] mb-10"
        >
          SAC<span className="text-sky-400">.</span>
        </Link>

        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/90 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-slate-600 mb-8">
            Sign in with your institution credentials.
          </p>

          {(hasAzure || hasGoogle) && (
            <>
              <div className="space-y-3">
                {hasAzure && (
                  <button
                    type="button"
                    onClick={() =>
                      signIn("azure-ad", { callbackUrl: "/portal" })
                    }
                    className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 py-3 px-4 text-sm font-medium text-slate-800"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 21 21" aria-hidden>
                      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                    Continue with Microsoft
                  </button>
                )}
                {hasGoogle && (
                  <button
                    type="button"
                    onClick={() =>
                      signIn("google", { callbackUrl: "/portal" })
                    }
                    className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 py-3 px-4 text-sm font-medium text-slate-800"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-500">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </>
          )}

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@geu.ac.in"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]/70 focus:ring-1 focus:ring-[#2563EB]/25 transition-all duration-200"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]/70 focus:ring-1 focus:ring-[#2563EB]/25 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center rounded-lg bg-[#2563EB] text-white text-sm font-semibold py-2.5 hover:bg-[#1d4ed8] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-600/15"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center leading-relaxed">
          Access restricted to authorised institution domains.
        </p>
      </motion.div>
    </div>
  );
}
