import { StatCard } from "@/components/dashboard/StatCard";
import { BookOpen, GraduationCap, Activity, Target } from "lucide-react";
import { getStudentAnalytics } from "@/actions/student";
import { StaggerWrapper } from "@/components/ui/StaggerWrapper";
import dbConnect from "@/lib/mongodb";
import UserProgress from "@/models/UserProgress";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDate } from "@/lib/utils";

type PopulatedCourse = {
  _id: unknown;
  title: string;
  description?: string;
};

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  await dbConnect();

  const recentProgress = await UserProgress.findOne({
    userId: session.user.id,
  })
    .sort({ lastActivityAt: -1 })
    .populate<{ courseId: PopulatedCourse | null }>({
      path: "courseId",
      model: Course,
      select: "title description",
    });

  const lastCourse = recentProgress?.courseId || null;

  const analyticsResult = await getStudentAnalytics();
  const stats = analyticsResult.success ? analyticsResult.stats : null;

  const enrolled = stats?.totalCoursesEnrolled || 0;
  const avgScore = stats?.averageScore || 0;
  const topicsDone = stats?.topicsCompleted || 0;

  const activityLabel = recentProgress?.lastActivityAt
    ? formatDate(recentProgress.lastActivityAt)
    : "—";

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-600 tracking-tight mb-2">
          Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-slate-600">
          Track your progress and pick up where you left off.
        </p>
      </div>

      <StaggerWrapper className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled"
          value={enrolled}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          title="Avg. Score"
          value={`${avgScore}%`}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          title="Topics Done"
          value={topicsDone}
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <StatCard
          title="Last Active"
          value={activityLabel}
          icon={<Activity className="w-5 h-5" />}
        />
      </StaggerWrapper>

      {lastCourse ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Continue learning
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-slate-800 truncate">
                  {lastCourse.title}
                </h3>
                {lastCourse.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {lastCourse.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${recentProgress?.progress || 0}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 w-8 shrink-0 text-right">
                {recentProgress?.progress || 0}%
              </span>
              <Link
                href={`/dashboard/student/courses/${String(lastCourse._id)}`}
                className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-sm shadow-blue-600/15"
              >
                Resume
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No activity yet"
          description="Enroll in a course to start learning and track your progress here."
          action={
            <Link
              href="/dashboard/student/courses"
              className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] text-white text-sm font-medium px-4 py-2 hover:bg-[#1d4ed8] transition-colors shadow-sm shadow-blue-600/15"
            >
              Browse courses
            </Link>
          }
        />
      )}
    </div>
  );
}
