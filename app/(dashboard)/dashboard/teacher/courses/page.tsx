import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BookOpen, Plus, Calendar } from "lucide-react";
import { getTeacherCourses } from "@/actions/teacher";

export default async function TeacherCoursesPage() {
  const { success, courses } = await getTeacherCourses();
  const safeCourses = success ? courses : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-50 mb-2">My Courses</h1>
          <p className="text-neutral-400">Manage your existing curriculum or create new learning paths.</p>
        </div>
        <Link 
          href="/dashboard/teacher/courses/new"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </Link>
      </div>

      {safeCourses.length === 0 ? (
        <EmptyState 
          title="No courses yet"
          description="You haven't created any courses yet. Start by defining your first curriculum."
          icon={<BookOpen className="w-8 h-8 text-neutral-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeCourses.map((course: any) => (
            <Link href={`/dashboard/teacher/courses/${course._id}/edit`} key={course._id} className="block rounded-2xl border border-white/5 bg-[#121212] p-6 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${course.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'}`}>
                  {course.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-medium text-neutral-100 mb-2 truncate">{course.title}</h3>
              <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{course.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {course.tags?.map((tag: string) => (
                  <span key={tag} className="text-[10px] font-medium text-neutral-500 bg-white/5 px-2 py-0.5 rounded">
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
