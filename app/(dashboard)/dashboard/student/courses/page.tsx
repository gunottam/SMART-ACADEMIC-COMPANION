import { EmptyState } from "@/components/dashboard/EmptyState";
import { BookOpen } from "lucide-react";
import { getPublishedCourses } from "@/actions/student";
import Link from "next/link";

type CourseCard = {
  _id: string;
  title: string;
  description?: string;
  tags?: string[];
  instructorId?: { name?: string } | null;
};

export default async function CoursesPage() {
  const result = await getPublishedCourses();
  const safeCourses = (result.success ? result.courses : []) as CourseCard[];

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-600 tracking-tight mb-2">
          Courses
        </h1>
        <p className="text-sm text-slate-600">
          Browse published courses and jump in when you&apos;re ready.
        </p>
      </div>

      {safeCourses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-5 h-5" />}
          title="No courses available"
          description="No courses have been published yet. Check back soon."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeCourses.map((course) => (
            <Link
              href={`/dashboard/student/courses/${course._id}`}
              key={course._id}
              className="group block rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-200 hover:shadow-md transition-all shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <span>By {course.instructorId?.name || "Instructor"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {course.tags?.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full"
                  >
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
