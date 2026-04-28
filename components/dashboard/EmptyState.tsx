"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-slate-200/90 bg-gradient-to-br from-[#fafcff] via-white to-[#eef4ff]/80 border-dashed"
    >
      <div className="w-12 h-12 mb-4 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] border border-blue-100">
        {icon || <Inbox className="w-5 h-5" strokeWidth={1.5} />}
      </div>
      <h3 className="text-base font-medium text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
