"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Shield, Users, Database, Settings, LogOut } from "lucide-react";

// Admin links
const sidebarLinks = [
  { icon: Shield, label: "System Status", href: "/dashboard/admin" },
  { icon: Users, label: "User Management", href: "/dashboard/admin/users" },
  { icon: Database, label: "All Courses", href: "/dashboard/admin/courses" },
  { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0A0A0A] p-6 justify-between shrink-0">
      {/* Top */}
      <div>
        <Link href="/portal" className="text-xl font-semibold tracking-tight text-neutral-50 mb-6 block">
          SAC<span className="text-red-400">.</span> 
        </Link>
        <div className="mb-8 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 tracking-wide uppercase inline-block">
          Master Console
        </div>

        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/dashboard/admin");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-white/5 text-red-400 font-medium"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <link.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile */}
      <div className="border-t border-white/5 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-400/20 flex items-center justify-center text-sm font-medium text-red-400">
            {session?.user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-neutral-200 truncate">{session?.user?.name || "Administrator"}</p>
            <p className="text-xs text-neutral-500 truncate">{session?.user?.email || "No Email"}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
