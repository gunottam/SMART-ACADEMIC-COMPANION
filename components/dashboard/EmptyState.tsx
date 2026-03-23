"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/5 bg-white/[0.01] border-dashed"
    >
      <div className="w-16 h-16 mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-neutral-50 mb-2">{title}</h3>
      <p className="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
