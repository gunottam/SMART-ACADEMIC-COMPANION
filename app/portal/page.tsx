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
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace(`/dashboard/${session?.user?.role || "student"}`);
    }
  }, [status, session, router]);

  if (status === "loading" || session?.user?.role !== "admin") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-[#f5f8ff] to-[#eef4ff]">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#2563EB] animate-spin" />
      </div>
    );
  }

  const entryPoints = [
    {
      title: "Student Experience",
      description: "View the platform exactly as an enrolled student would.",
      icon: GraduationCap,
      href: "/dashboard/student",
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      title: "Instructor Portal",
      description: "Manage courses, review assessments, and monitor cohort progress.",
      icon: BookOpen,
      href: "/dashboard/teacher",
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      title: "Master Console",
      description: "System-wide controls, role assignments, and global database views.",
      icon: Shield,
      href: "/dashboard/admin",
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
  ];

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-gradient-to-b from-[#f5f8ff] via-[#f8fafc] to-[#eef4ff]">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Shield className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={2.5} /> Master Access Granted
          </motion.div>
          <h1 className="text-3xl font-semibold text-[#2563EB] mb-3 tracking-tight">System Portal</h1>
          <p className="text-slate-600">Welcome back, Developer. Choose your operational environment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {entryPoints.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => router.push(entry.href)}
              className="p-6 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/80 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 border ${entry.bg} ${entry.border} ${entry.color} relative z-10`}>
                <entry.icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-medium text-slate-900 mb-2 relative z-10">{entry.title}</h2>
              <p className="text-sm text-slate-600 mb-8 flex-1 relative z-10">{entry.description}</p>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 group-hover:text-[#2563EB] transition-colors relative z-10">
                Launch Environment <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
