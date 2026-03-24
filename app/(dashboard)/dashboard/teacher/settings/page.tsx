import { Settings } from "lucide-react";

export default function TeacherSettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-50 mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-neutral-400" />
          Account Settings
        </h1>
        <p className="text-neutral-400">Manage your instructor preferences and notification behaviors.</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-inner">
        <Settings className="w-16 h-16 text-neutral-600 mb-4 animate-[spin_10s_linear_infinite]" />
        <h2 className="text-xl font-medium text-neutral-300 mb-2">Settings Coming Soon</h2>
        <p className="text-neutral-500 max-w-sm">The administrative preferences panel is currently under construction for system phase 2.</p>
      </div>
    </div>
  );
}
