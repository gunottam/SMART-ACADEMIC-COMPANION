"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

/* ── Feature data ───────────────────────────────────────── */
const features = [
  {
    icon: Brain,
    title: "Diagnostic Mastery",
    description:
      "AI-powered assessments that map your knowledge topology and pinpoint exact conceptual gaps with surgical precision.",
    span: "md:col-span-2",
  },
  {
    icon: Activity,
    title: "AI Rescue Paths",
    description:
      "Dynamically generated learning trajectories that adapt in real-time to your progress and performance patterns.",
    span: "md:col-span-1",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Comprehensive dashboards with deep-dive metrics on your strengths, weaknesses, and growth velocity.",
    span: "md:col-span-1",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Get immediate, contextual feedback on every response — understand not just what, but why.",
    span: "md:col-span-1",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade data protection. Your academic data never leaves our encrypted infrastructure.",
    span: "md:col-span-1",
  },
  {
    icon: Sparkles,
    title: "Adaptive Curriculum",
    description:
      "Machine-learning models that continuously refine your syllabus to match your optimal learning pace and style.",
    span: "md:col-span-2",
  },
];

/* ── Animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/[0.04] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-neutral-400 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" strokeWidth={1.5} />
              Intelligent Tutoring System
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-neutral-50"
          >
            Master your curriculum,{" "}
            <span className="bg-gradient-to-r from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              artificially.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            An AI-native academic companion that diagnoses your weaknesses,
            builds rescue learning paths, and tracks mastery in real time —
            so you can study smarter, not harder.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-white text-black text-sm font-medium px-6 py-3 hover:bg-neutral-200 transition-colors duration-200"
              >
                Start Learning Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-sm font-medium text-neutral-300 px-6 py-3 hover:bg-white/5 transition-colors duration-200"
              >
                Explore Features
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURES — BENTO GRID ═══════════ */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-50">
              Everything you need to{" "}
              <span className="text-indigo-400">excel</span>
            </h2>
            <p className="mt-4 text-neutral-400 max-w-xl mx-auto leading-relaxed">
              A thoughtfully engineered suite of tools designed to transform how
              you learn, practice, and master complex subjects.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`group relative rounded-2xl border border-white/5 bg-[#121212] p-8 transition-all duration-300 hover:border-white/10 ${feature.span}`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.04] border border-white/5 mb-5">
                    <feature.icon
                      className="w-5 h-5 text-indigo-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ METHODOLOGY / SOCIAL PROOF ═══════════ */}
      <section id="methodology" className="px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-50 mb-6">
              Built on proven pedagogy
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-16">
              Our methodology combines spaced repetition, active recall, and
              adaptive difficulty — backed by decades of cognitive science
              research and enhanced with modern AI.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { metric: "94%", label: "Average improvement in test scores" },
              { metric: "2.3x", label: "Faster concept mastery vs. traditional study" },
              { metric: "10k+", label: "Students actively using SAC" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-white/5 bg-[#121212] p-8"
              >
                <p className="text-4xl font-bold text-indigo-400 mb-2">
                  {stat.metric}
                </p>
                <p className="text-sm text-neutral-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section id="pricing" className="px-6 py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-50 mb-4">
              Ready to study smarter?
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed mb-10">
              Join thousands of students who are already accelerating their
              academic performance with SAC.
            </p>
            <motion.div whileHover={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-white text-black text-sm font-medium px-8 py-3.5 hover:bg-neutral-200 transition-colors duration-200 shadow-[0_0_40px_rgba(129,140,248,0.12)]"
              >
                Get Started — It&apos;s Free
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
