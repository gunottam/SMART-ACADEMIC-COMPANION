"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export type SidebarLink = {
  icon: LucideIcon;
  label: string;
  href: string;
};

type Accent = "indigo" | "emerald" | "red";

type DashboardShellProps = {
  links: SidebarLink[];
  accent: Accent;
  label?: string;
  rootHref: string;
  children: ReactNode;
};

const accentMap: Record<
  Accent,
  {
    dot: string;
    active: string;
    badgeBg: string;
    badgeText: string;
    avatarBg: string;
    avatarText: string;
    avatarBorder: string;
  }
> = {
  indigo: {
    dot: "text-sky-400",
    active: "text-[#2563EB]",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-800",
    avatarBg: "bg-blue-100",
    avatarText: "text-blue-900",
    avatarBorder: "border-blue-200",
  },
  emerald: {
    dot: "text-sky-400",
    active: "text-[#2563EB]",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-800",
    avatarBg: "bg-blue-100",
    avatarText: "text-blue-900",
    avatarBorder: "border-blue-200",
  },
  red: {
    dot: "text-sky-400",
    active: "text-[#2563EB]",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-800",
    avatarBg: "bg-blue-100",
    avatarText: "text-blue-900",
    avatarBorder: "border-blue-200",
  },
};

export default function DashboardShell({
  links,
  accent,
  label,
  rootHref,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        links={links}
        accent={accent}
        label={label}
        rootHref={rootHref}
        variant="desktop"
      />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 bg-white/95 backdrop-blur text-slate-600 hover:text-[#2563EB]"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
            aria-label="Close navigation"
          />
          <Sidebar
            links={links}
            accent={accent}
            label={label}
            rootHref={rootHref}
            variant="mobile"
            onClose={() => setOpen(false)}
          />
        </div>
      )}

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#f5f8ff] via-[#f8fafc] to-[#eef4ff] pt-16 md:pt-0">{children}</main>
    </div>
  );
}

function Sidebar({
  links,
  accent,
  label,
  rootHref,
  variant,
  onClose,
}: {
  links: SidebarLink[];
  accent: Accent;
  label?: string;
  rootHref: string;
  variant: "desktop" | "mobile";
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const styles = accentMap[accent];

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-slate-200 bg-white/95 p-6 justify-between shrink-0",
        variant === "desktop" && "hidden md:flex",
        variant === "mobile" && "absolute left-0 top-0 bottom-0 z-10 w-72"
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <Link
            href={rootHref}
            className="text-xl font-semibold tracking-tight text-[#2563EB] block"
          >
            SAC<span className={styles.dot}>.</span>
          </Link>
          {variant === "mobile" && (
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {label && (
          <div
            className={cn(
              "mb-8 px-3 py-1.5 rounded-md border text-xs font-semibold tracking-wide uppercase inline-block",
              styles.badgeBg,
              styles.badgeText
            )}
          >
            {label}
          </div>
        )}

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (pathname.startsWith(link.href + "/") && link.href !== rootHref);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={variant === "mobile" ? onClose : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200",
                  isActive
                    ? cn("bg-blue-50 font-medium", styles.active)
                    : "text-slate-600 hover:text-[#2563EB] hover:bg-slate-50"
                )}
              >
                <link.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "w-9 h-9 rounded-full border flex items-center justify-center text-sm font-medium",
              styles.avatarBg,
              styles.avatarBorder,
              styles.avatarText
            )}
          >
            {initials(session?.user?.name)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">
              {session?.user?.name || "Guest"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#2563EB] transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
