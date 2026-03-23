"use client";

import { useSession } from "next-auth/react";
import { User as UserIcon, Bell, Shield, Paintbrush } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50 tracking-tight mb-2">
          Account Settings
        </h1>
        <p className="text-sm text-neutral-400">
          Manage your personal information, preferences, and security.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav Settings internally */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
          {[
            { id: "profile", label: "Profile", icon: UserIcon, active: true },
            { id: "notifications", label: "Notifications", icon: Bell, active: false },
            { id: "appearance", label: "Appearance", icon: Paintbrush, active: false },
            { id: "security", label: "Security", icon: Shield, active: false },
          ].map((item) => (
             <button key={item.id} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}>
               <item.icon className="w-4 h-4" />
               {item.label}
             </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-6">
            <h3 className="text-lg font-medium text-neutral-50 border-b border-white/5 pb-4">Profile Information</h3>
            
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full border border-white/10 bg-indigo-500/20 flex flex-col items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold text-indigo-400">
                    {session?.user?.name?.[0]?.toUpperCase() || "GM"}
                  </span>
                )}
              </div>
              <div>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
                  Change Avatar
                </button>
                <p className="text-[10px] text-neutral-500 mt-2 uppercase tracking-wide">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">Full Name</label>
                <input type="text" defaultValue={session?.user?.name || ""} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">Email Address (Role: {session?.user?.role || "Student"})</label>
                <input type="email" disabled defaultValue={session?.user?.email || ""} className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 text-sm text-neutral-600 cursor-not-allowed" />
                <p className="text-[10px] text-neutral-500">Security lock: Bound to your @geu.ac.in domain.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black text-sm font-medium rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
