import { StatCard } from "@/components/dashboard/StatCard";
import { BookOpen, Users, Star, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import UserProgress from "@/models/UserProgress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTeacherAnalytics } from "@/actions/teacher";
import { TeacherDoubts } from "@/components/dashboard/TeacherDoubts";
import { SyncButton } from "@/components/dashboard/SyncButton";

export default async function TeacherDashboardPage() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const instructorId = (session?.user as any)?.id;

  // Active Courses
  const courses = await Course.find({ instructorId });
  const activeCount = courses.filter(c => c.status === "published").length;
  const courseIds = courses.map(c => c._id);

  // Analyze Student Progress Data
  const progresses = await UserProgress.find({ courseId: { $in: courseIds } });
  const uniqueStudents = new Set(progresses.map(p => p.userId.toString())).size;

  let totalAssessmentsTaken = 0;
  progresses.forEach(p => {
    totalAssessmentsTaken += p.assessmentAttempts?.length || 0;
  });

  const analyticsRes = await getTeacherAnalytics();
  const avgScores = analyticsRes.success ? analyticsRes.analytics.avgScores : [];
  const weakTopics = analyticsRes.success ? analyticsRes.analytics.weakTopics : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-50 mb-2">Instructor Overview</h1>
          <p className="text-neutral-400">Welcome to your teaching console. Here's what's happening today.</p>
        </div>
        <SyncButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Courses"
          value={activeCount.toString()}
          icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Total Students"
          value={uniqueStudents.toString()}
          icon={<Users className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Average Rating"
          value="4.8"
          icon={<Star className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Assessments Taken"
          value={totalAssessmentsTaken.toString()}
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Teacher Doubts Inbox */}
      <TeacherDoubts />

      {/* Analytics Data Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Average Course Scores */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-2xl shadow-emerald-900/10">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-neutral-50">My Course Averages</h2>
          </div>
          <div className="space-y-6">
            {avgScores.length === 0 ? (
              <p className="text-neutral-500 text-sm">No course score data available for your students yet.</p>
            ) : (
              avgScores.map((score: any) => (
                <div key={score.courseId} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-200">{score.courseName}</span>
                    <span className="text-sm font-bold text-emerald-400">{score.averageScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 flex rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${Math.min(100, score.averageScore)}%` }} />
                  </div>
                  <p className="text-xs text-neutral-500">{score.totalStudents} student{score.totalStudents !== 1 ? 's' : ''} enrolled</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Common Weak Topics */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-2xl shadow-red-900/10">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-neutral-50">Class Weak Topics</h2>
          </div>
          <div className="space-y-3">
            {weakTopics.length === 0 ? (
              <p className="text-neutral-500 text-sm">No weak topics detected in your courses yet.</p>
            ) : (
              weakTopics.map((topic: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-bold border border-red-500/20">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-neutral-200 truncate pr-4">{topic.topicName}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-red-400">{topic.frequency} <span className="text-xs font-medium text-red-400/70">Fails</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
