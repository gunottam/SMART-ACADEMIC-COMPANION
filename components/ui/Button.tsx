"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-sm shadow-blue-600/15 disabled:bg-[#2563EB]/55",
  secondary:
    "bg-gradient-to-br from-white to-blue-50/70 text-slate-700 border border-slate-200/90 hover:from-blue-50/80 hover:to-blue-100/50 disabled:opacity-50",
  ghost:
    "bg-transparent text-slate-600 hover:bg-blue-50/80 hover:text-slate-900",
  outline:
    "border border-slate-200 bg-gradient-to-br from-white to-blue-50/40 text-slate-700 hover:from-blue-50/60 hover:to-blue-100/40 hover:text-slate-900",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/55",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      leftIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex items-center">{leftIcon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
