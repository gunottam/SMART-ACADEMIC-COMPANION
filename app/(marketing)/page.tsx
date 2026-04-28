"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Brain,
    title: "Diagnostic Mastery",
    description:
      "AI-powered assessments map your knowledge topology and pinpoint exact conceptual gaps.",
    span: "md:col-span-2",
  },
  {
    icon: Activity,
    title: "AI Rescue Paths",
    description:
      "Dynamically generated learning trajectories that adapt to your performance in real time.",
    span: "md:col-span-1",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Transparent dashboards with clear views of strengths, weaknesses and growth over time.",
    span: "md:col-span-1",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Contextual feedback on every response — understand not just what, but why.",
    span: "md:col-span-1",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Academic data stays within institutional domains with strict access control.",
    span: "md:col-span-1",
  },
  {
    icon: Sparkles,
    title: "Adaptive Curriculum",
    description:
      "Course content that refines itself to match your pace and mastery level.",
    span: "md:col-span-2",
  },
];

const pedagogy = [
  "Spaced repetition to beat the forgetting curve",
  "Active recall to strengthen long-term retention",
  "Adaptive difficulty that keeps you in flow",
  "Evidence-based progress tracking",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <>
      <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#3b82f6] to-[#1d4ed8]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, rgba(255,255,255,0.35) 0%, transparent 42%), radial-gradient(circle at 85% 75%, rgba(147,197,253,0.35) 0%, transparent 45%)",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(90vw,720px)] h-[380px] bg-white/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] bg-sky-300/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/12 backdrop-blur-sm px-4 py-1.5 text-xs text-white/95 mb-8 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-200" strokeWidth={1.5} />
              Smart Academic Companion
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white drop-shadow-[0_2px_24px_rgba(15,23,42,0.2)]"
          >
            Study what matters,{" "}
            <span className="bg-gradient-to-r from-white via-sky-100 to-blue-100 bg-clip-text text-transparent">
              skip what you already know.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_12px_rgba(15,23,42,0.15)]"
          >
            SAC diagnoses your weak spots, builds a personalised learning path,
            and tracks mastery topic-by-topic. Built for real classrooms, not
            demos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-[#2563EB] text-sm font-semibold px-6 py-3 shadow-lg shadow-slate-900/15 hover:bg-sky-50 transition-colors duration-200"
            >
              Sign in with your institution
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border border-white/50 bg-white/10 backdrop-blur-sm text-sm font-medium text-white px-6 py-3 hover:bg-white/18 hover:border-white/65 transition-colors duration-200"
            >
              See what it does
            </a>
          </motion.div>
        </div>
      </section>

      <section
        id="features"
        className="px-6 py-24 bg-gradient-to-b from-[#f5f8ff] via-[#f8fafc] to-[#eef4ff]"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2563EB]">
              Everything you need to{" "}
              <span className="text-sky-600">actually learn</span>
            </h2>
            <p className="mt-4 text-slate-600 max-w-xl mx-auto leading-relaxed">
              A focused set of tools that turn coursework into measurable
              progress — for students and instructors alike.
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
                className={`group relative rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/80 p-8 transition-all duration-300 hover:border-blue-200 hover:shadow-md ${feature.span}`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 mb-5">
                    <feature.icon
                      className="w-5 h-5 text-[#2563EB]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="methodology"
        className="px-6 py-24 border-t border-slate-200 bg-gradient-to-b from-white via-[#f8fbff] to-[#f0f6ff]"
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2563EB] mb-4">
              Built on proven pedagogy
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Cognitive science, not gimmicks. SAC blends techniques with
              decades of classroom evidence behind them, and layers modern AI on
              top to personalise the experience.
            </p>
            <ul className="space-y-3">
              {pedagogy.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2
                    className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0"
                    strokeWidth={2}
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#fafcff] via-white to-[#eef4ff] p-8 shadow-sm"
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                  For students
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enroll in courses, work through adaptive topics, take quizzes,
                  submit assignments and track mastery — all in one place.
                </p>
              </div>
              <div className="h-px bg-slate-200" />
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                  For instructors
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Build structured curriculum, grade submissions, resolve
                  student doubts and see where the class is actually
                  struggling.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="pricing"
        className="px-6 py-24 border-t border-slate-200 bg-gradient-to-b from-[#eef4ff] via-[#f8fafc] to-[#f5f8ff]"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2563EB] mb-4">
              Ready when you are
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto leading-relaxed mb-10">
              Sign in with your institution email to get started. Role and
              access are assigned automatically.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-white text-sm font-semibold px-8 py-3.5 hover:bg-[#1d4ed8] transition-colors duration-200 shadow-lg shadow-blue-600/25"
            >
              Go to sign in
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
