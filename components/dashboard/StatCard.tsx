"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-6 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-2xl relative overflow-hidden group shadow-2xl shadow-cyan-900/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Neon Glow under icon */}
      <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-2xl rounded-full bg-cyan-500 pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-sm font-semibold tracking-wide text-neutral-400 uppercase">{title}</h3>
        <div className="p-2.5 bg-white/5 rounded-xl text-cyan-400 border border-white/10 shadow-inner group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/30 transition-all duration-300">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3 relative z-10">
        <p className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500 drop-shadow-sm">{value}</p>
        {trend && (
          <span className={`text-xs font-bold mb-1.5 px-2 py-1 rounded-md bg-black/40 border ${trend.isPositive ? 'text-emerald-400 border-emerald-500/20' : 'text-red-400 border-red-500/20'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
