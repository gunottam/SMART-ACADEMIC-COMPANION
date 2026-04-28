import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function initials(name?: string | null, fallback = "SC"): string {
  if (!name) return fallback;
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();
}
