"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
} from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
  { icon: BookOpen, label: "Courses", href: "/dashboard/student/courses" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/student/analytics" },
  {
    icon: GraduationCap,
    label: "Assessments",
    href: "/dashboard/student/assessments",
  },
  { icon: Settings, label: "Settings", href: "/dashboard/student/settings" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      links={sidebarLinks}
      accent="indigo"
      rootHref="/dashboard/student"
    >
      {children}
    </DashboardShell>
  );
}
