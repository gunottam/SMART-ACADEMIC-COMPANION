"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, BookOpen, Users, Settings, LogOut } from "lucide-react";

// Teacher links
const sidebarLinks = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/teacher" },
  { icon: BookOpen, label: "Manage Courses", href: "/dashboard/teacher/courses" },
  { icon: Users, label: "Students", href: "/dashboard/teacher/students" },
  { icon: Settings, label: "Settings", href: "/dashboard/teacher/settings" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <TeacherSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function TeacherSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0A0A0A] p-6 justify-between shrink-0">
      {/* Top */}
      <div>
        <Link href="/portal" className="text-xl font-semibold tracking-tight text-neutral-50 mb-6 block">
          SAC<span className="text-emerald-400">.</span> 
        </Link>
        <div className="mb-8 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 tracking-wide uppercase inline-block">
          Instructor Portal
        </div>

        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/dashboard/teacher");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-white/5 text-emerald-400 font-medium"
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
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center text-sm font-medium text-emerald-400">
            {session?.user?.name?.[0]?.toUpperCase() || "T"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-neutral-200 truncate">{session?.user?.name || "Instructor"}</p>
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
