"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  CheckSquare,
} from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/teacher" },
  { icon: BookOpen, label: "Manage Courses", href: "/dashboard/teacher/courses" },
  { icon: CheckSquare, label: "Assessments", href: "/dashboard/teacher/assessments" },
  { icon: Users, label: "Students", href: "/dashboard/teacher/students" },
  { icon: Settings, label: "Settings", href: "/dashboard/teacher/settings" },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      links={sidebarLinks}
      accent="emerald"
      label="Instructor Portal"
      rootHref="/dashboard/teacher"
    >
      {children}
    </DashboardShell>
  );
}
