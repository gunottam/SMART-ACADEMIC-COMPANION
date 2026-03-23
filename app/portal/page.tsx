"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Shield, ArrowRight } from "lucide-react";

export default function PortalGateway() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      // Auto-redirect normal students directly to their dashboard
      // (Bypasses this screen completely)
      router.replace("/dashboard/student");
    }
  }, [status, session, router]);

  if (status === "loading" || (session?.user as any)?.role !== "admin") {
    // Subtle loading spinner while verifying security
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 rounded-full border-t-2 border-cyan-400 animate-spin" />
      </div>
    );
  }

  // Admin View Options
  const entryPoints = [
    {
      title: "Student Experience",
      description: "View the platform exactly as an enrolled student would.",
      icon: GraduationCap,
      href: "/dashboard/student",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20"
    },
    {
      title: "Instructor Portal",
      description: "Manage courses, review assessments, and monitor cohort progress.",
      icon: BookOpen,
      href: "/dashboard/teacher", // To be implemented
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20"
    },
    {
      title: "Master Console",
      description: "System-wide controls, role assignments, and global database views.",
      icon: Shield,
      href: "/dashboard/admin", // To be implemented
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/20"
    }
  ];

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-[#0A0A0A]">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Shield className="w-3.5 h-3.5" strokeWidth={2.5} /> Master Access Granted
          </motion.div>
          <h1 className="text-3xl font-semibold text-neutral-50 mb-3 tracking-tight">System Portal</h1>
          <p className="text-neutral-400">Welcome back, Developer. Choose your operational environment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entryPoints.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => router.push(entry.href)}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 border ${entry.bg} ${entry.border} ${entry.color} relative z-10`}>
                <entry.icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-medium text-neutral-50 mb-2 relative z-10">{entry.title}</h2>
              <p className="text-sm text-neutral-400 mb-8 flex-1 relative z-10">{entry.description}</p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 group-hover:text-white transition-colors relative z-10">
                Launch Environment <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
