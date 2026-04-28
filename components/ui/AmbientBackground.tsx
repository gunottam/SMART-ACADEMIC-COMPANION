import React from "react";

export default function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#f0f6ff] via-[#f8fafc] to-[#e8f0ff]"
    >
      <div className="absolute -top-40 left-1/2 h-[720px] w-[1100px] -translate-x-1/2 rounded-full bg-[#2563EB]/14 blur-[155px]" />
      <div className="absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full bg-sky-400/12 blur-[130px]" />
      <div className="absolute bottom-0 right-0 h-[480px] w-[480px] rounded-full bg-[#2563EB]/10 blur-[150px]" />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.2) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(243,247,255,0.85)_100%)]" />
    </div>
  );
}
