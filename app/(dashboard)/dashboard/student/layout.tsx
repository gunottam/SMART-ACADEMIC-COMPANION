"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
  { icon: BookOpen, label: "Courses", href: "/dashboard/student/courses" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/student/analytics" },
  { icon: GraduationCap, label: "Assessments", href: "/dashboard/student/assessments" },
  { icon: Settings, label: "Settings", href: "/dashboard/student/settings" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function StudentSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0A0A0A] p-6 justify-between shrink-0">
      {/* Top */}
      <div>
        {/* Logo */}
        <Link
          href="/portal"
          className="text-xl font-semibold tracking-tight text-neutral-50 mb-10 block"
        >
          SAC<span className="text-indigo-400">.</span>
        </Link>

        {/* Nav Links */}
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-white/5 text-white font-medium"
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

      {/* Bottom — Profile */}
      <div className="border-t border-white/5 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-sm font-medium text-indigo-400">
            {session?.user?.name?.[0]?.toUpperCase() || "GM"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-neutral-200 truncate">
              {session?.user?.name || "Guest"}
            </p>
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
