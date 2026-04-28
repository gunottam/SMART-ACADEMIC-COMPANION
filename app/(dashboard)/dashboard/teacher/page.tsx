import { StatCard } from "@/components/dashboard/StatCard";
import { BookOpen, Users, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getTeacherDashboardData } from "@/actions/teacher";
import { TeacherDoubts } from "@/components/dashboard/TeacherDoubts";

type AvgScoreRow = {
  courseId: string;
  courseName: string;
  averageScore: number;
  totalStudents: number;
};

type WeakTopicRow = {
  topicName: string;
  frequency: number;
};

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const dash = await getTeacherDashboardData();
  if (!dash.success) {
    return (
      <div className="px-8 py-12 text-red-700 rounded-xl border border-red-100 bg-red-50 max-w-lg">
        {dash.error ?? "Unable to load instructor dashboard."}
      </div>
    );
  }

  const avgScores = dash.avgScores as AvgScoreRow[];
  const weakTopics = dash.weakTopics as WeakTopicRow[];

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-blue-600 mb-2">Instructor Overview</h1>
          <p className="text-slate-600">Welcome to your teaching console. Here&apos;s what&apos;s happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Courses"
          value={dash.activeCount.toString()}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Total Students"
          value={dash.uniqueStudents.toString()}
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Assessments Taken"
          value={dash.totalAssessmentsTaken.toString()}
          icon={<Activity className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Courses Tracked"
          value={dash.totalCourses.toString()}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
        />
      </div>

      <TeacherDoubts initialDoubts={dash.doubts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">My Course Averages</h2>
          </div>
          <div className="space-y-6">
            {avgScores.length === 0 ? (
              <p className="text-slate-500 text-sm">No course score data available for your students yet.</p>
            ) : (
              avgScores.map((score) => (
                <div key={score.courseId} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">{score.courseName}</span>
                    <span className="text-sm font-bold text-blue-600">{score.averageScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 flex rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-gradient-to-r from-blue-700 to-blue-400 rounded-full" style={{ width: `${Math.min(100, score.averageScore)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">{score.totalStudents} student{score.totalStudents !== 1 ? "s" : ""} enrolled</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-slate-900">Class Weak Topics</h2>
          </div>
          <div className="space-y-3">
            {weakTopics.length === 0 ? (
              <p className="text-slate-500 text-sm">No weak topics detected in your courses yet.</p>
            ) : (
              weakTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold border border-red-100">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-800 truncate pr-4">{topic.topicName}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-red-600">{topic.frequency} <span className="text-xs font-medium text-red-500/80">Fails</span></span>
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
