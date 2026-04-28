import { Trash2 } from "lucide-react";
import { getAllCourses, deleteCourse } from "@/actions/admin";
import { revalidatePath } from "next/cache";

type CourseRow = {
  _id: string;
  title: string;
  description?: string;
  status: string;
  instructorId?: { name?: string; email?: string } | null;
};

export default async function AdminCoursesPage() {
  const res = await getAllCourses();
  const courses = (res.success ? res.courses : []) as CourseRow[];

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-600">Course Registry</h1>
        <p className="text-sm text-slate-600">View and manage all system courses globally.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Instructor</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-slate-500">No courses created yet.</td></tr>
            ) : courses.map((course) => (
              <tr key={course._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-blue-600">{course.title}</span><br />
                  <span className="text-xs text-slate-500 line-clamp-1">{course.description}</span>
                </td>
                <td className="px-6 py-4">{course.instructorId?.name || course.instructorId?.email || "Unknown"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${course.status === "published" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                    {course.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <form
                    action={async () => {
                      "use server";
                      await deleteCourse(course._id);
                      revalidatePath("/dashboard/admin/courses");
                    }}
                  >
                    <button
                      type="submit"
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
