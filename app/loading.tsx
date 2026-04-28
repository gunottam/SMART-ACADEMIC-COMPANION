import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex items-center gap-3 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
