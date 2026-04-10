"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, Edit, BookOpen } from "lucide-react";
import { getAllCourses, deleteCourse } from "@/actions/admin";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const res = await getAllCourses();
    if (res.success) setCourses(res.courses || []);
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to completely delete "${name}"? This action is irreversible.`)) {
      const res = await deleteCourse(id);
      if (res.success) {
        setCourses(courses.filter((c) => c._id !== id));
      } else {
        alert(res.error);
      }
    }
  };

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">Course Registry</h1>
        <p className="text-sm text-neutral-400">View and manage all system courses globally.</p>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="bg-white/[0.02] border-b border-white/5 text-neutral-300">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Instructor</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {courses.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8">No courses created yet.</td></tr>
            ) : courses.map((course) => (
              <tr key={course._id} className="hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-cyan-400">{course.title}</span><br />
                  <span className="text-xs text-neutral-500 line-clamp-1">{course.description}</span>
                </td>
                <td className="px-6 py-4">{course.instructorId?.name || course.instructorId?.email || "Unknown"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${course.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                    {course.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(course._id, course.title)} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
