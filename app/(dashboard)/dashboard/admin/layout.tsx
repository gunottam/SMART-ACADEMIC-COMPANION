"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import { Shield, Users, Database } from "lucide-react";

const sidebarLinks = [
  { icon: Shield, label: "System Status", href: "/dashboard/admin" },
  { icon: Users, label: "User Management", href: "/dashboard/admin/users" },
  { icon: Database, label: "All Courses", href: "/dashboard/admin/courses" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      links={sidebarLinks}
      accent="red"
      label="Master Console"
      rootHref="/dashboard/admin"
    >
      {children}
    </DashboardShell>
  );
}
