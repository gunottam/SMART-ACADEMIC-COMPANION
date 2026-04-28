"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Methodology", href: "#methodology" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-gradient-to-r from-white/92 via-[#f8fbff]/95 to-[#f0f6ff]/92 border-b border-slate-200/90"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-[#2563EB]">
          SAC<span className="text-sky-400">.</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm text-slate-600 hover:text-[#2563EB] transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-[#2563EB] transition-colors duration-200 hidden sm:block"
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] text-white text-sm font-medium px-4 py-2 hover:bg-[#1d4ed8] transition-colors duration-200 shadow-sm shadow-blue-600/20"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>
    </motion.header>
  );
}
