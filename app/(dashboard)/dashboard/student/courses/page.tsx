
import { EmptyState } from "@/components/dashboard/EmptyState";
import { BookOpen, Plus } from "lucide-react";
import { getPublishedCourses } from "@/actions/student";
import Link from "next/link";

export default async function CoursesPage() {
  const { success, courses } = await getPublishedCourses();
  const safeCourses = success ? courses : [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50 tracking-tight mb-2">
            My Courses
          </h1>
          <p className="text-sm text-neutral-400">
            Manage your enrolled courses and discover new ones.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {safeCourses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8 text-neutral-400" />}
            title="No Active Courses"
            description="The instructors haven't published any courses yet. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeCourses.map((course: any) => (
               <Link href={`/dashboard/student/courses/${course._id}`} key={course._id} className="rounded-2xl border border-white/5 bg-[#121212] p-6 hover:border-white/10 transition-colors cursor-pointer group block">
                 <h3 className="text-lg font-medium text-neutral-100 mb-2 group-hover:text-cyan-400 transition-colors truncate">{course.title}</h3>
                 <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{course.description}</p>
                 <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
                   Instructor: {course.instructorId?.name || "Unknown"}
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {course.tags?.map((tag: string) => (
                     <span key={tag} className="text-[10px] font-medium text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                       {tag}
                     </span>
                   ))}
                 </div>
               </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
