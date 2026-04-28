"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };

type ToastDetail = { kind: ToastKind; message: string };

const TOAST_EVENT = "sac:toast";

export function toast(kind: ToastKind, message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { kind, message } })
  );
}

toast.success = (message: string) => toast("success", message);
toast.error = (message: string) => toast("error", message);
toast.info = (message: string) => toast("info", message);

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let next = 1;
    const handle = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      const id = next++;
      setItems((prev) => [...prev, { id, ...detail }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    };
    window.addEventListener(TOAST_EVENT, handle as EventListener);
    return () => window.removeEventListener(TOAST_EVENT, handle as EventListener);
  }, []);

  const dismiss = (id: number) =>
    setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2",
            t.kind === "success" &&
              "border-emerald-200/80 bg-emerald-50 text-emerald-900",
            t.kind === "error" &&
              "border-red-200/80 bg-red-50 text-red-900",
            t.kind === "info" &&
              "border-blue-200/90 bg-gradient-to-br from-blue-50 to-sky-50 text-slate-900"
          )}
        >
          {t.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : t.kind === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
          )}
          <p className="flex-1 leading-relaxed">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded text-slate-500 hover:text-slate-800"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
