import { StatCard } from "@/components/dashboard/StatCard";
import { BookOpen, GraduationCap, Flame, Target } from "lucide-react";
import { getStudentAnalytics } from "@/actions/student";
import { StaggerWrapper } from "@/components/ui/StaggerWrapper";
import dbConnect from "@/lib/mongodb";
import UserProgress from "@/models/UserProgress";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function DashboardOverview() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  const recentProgress = await UserProgress.findOne({ userId: (session?.user as any)?.id })
    .sort({ lastActivityAt: -1 })
    .populate({ path: 'courseId', model: Course });

  let lastCourse: any = null;
  if (recentProgress && recentProgress.courseId) {
    lastCourse = recentProgress.courseId;
  }

  const { success, stats } = await getStudentAnalytics();
  
  const enrolled = stats?.totalCoursesEnrolled || 0;
  const avgScore = stats?.averageScore || 0;
  const topicsDone = stats?.topicsCompleted || 0;
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50 tracking-tight mb-2">
          Dashboard Overview
        </h1>
        <p className="text-sm text-neutral-400">
          Track your academic progress and upcoming modules.
        </p>
      </div>

      <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={enrolled}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          title="Avg. Assessment Score"
          value={`${avgScore}%`}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          title="Topics Completed"
          value={topicsDone}
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <StatCard
          title="Current Streak"
          value="Active"
          icon={<Flame className="w-5 h-5" />}
        />
      </StaggerWrapper>

      {/* Continue Learning Section */}
      {lastCourse && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6">
          <h2 className="text-lg font-medium text-neutral-50 mb-4">Continue Learning</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-[400px]">{lastCourse.title}</h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{lastCourse.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
              <div className="flex-1 sm:w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${recentProgress?.progress || 0}%` }} />
              </div>
              <span className="text-xs font-medium text-neutral-400 w-8">{recentProgress?.progress || 0}%</span>
              <Link href={`/dashboard/student/courses/${lastCourse._id}`} className="shrink-0 px-6 py-2.5 text-sm font-bold text-black bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                Resume
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
