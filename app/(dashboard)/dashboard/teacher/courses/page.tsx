import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BookOpen, Plus } from "lucide-react";
import { getTeacherCourses } from "@/actions/teacher";

export default async function TeacherCoursesPage() {
  const { success, courses } = await getTeacherCourses();
  const safeCourses = success ? courses : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-blue-600 mb-2">My Courses</h1>
          <p className="text-slate-600">Manage your existing curriculum or create new learning paths.</p>
        </div>
        <Link 
          href="/dashboard/teacher/courses/new"
          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </Link>
      </div>

      {safeCourses.length === 0 ? (
        <EmptyState 
          title="No courses yet"
          description="You haven't created any courses yet. Start by defining your first curriculum."
          icon={<BookOpen className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeCourses.map((course: { _id: string; title: string; description?: string; status: string; tags?: string[] }) => (
            <Link href={`/dashboard/teacher/courses/${course._id}/edit`} key={course._id} className="block rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/70 p-6 hover:border-blue-200 hover:shadow-md transition-all group shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${course.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {course.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2 truncate">{course.title}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {course.tags?.map((tag: string) => (
                  <span key={tag} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
