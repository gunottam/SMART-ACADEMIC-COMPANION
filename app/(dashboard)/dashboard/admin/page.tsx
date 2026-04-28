import { StatCard } from "@/components/dashboard/StatCard";
import { Users, Shield, Database, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getAdminAnalytics, getSystemSnapshot } from "@/actions/admin";

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

export default async function AdminDashboardPage() {
  await dbConnect();

  const totalUsers = await User.countDocuments();
  const activeAdmins = await User.countDocuments({ role: "admin" });
  const snapshotRes = await getSystemSnapshot();
  const snapshot = snapshotRes.success
    ? snapshotRes.snapshot
    : { courses: 0, openDoubts: 0 };

  const analyticsRes = await getAdminAnalytics();
  const avgScores = analyticsRes.success
    ? (analyticsRes.analytics.avgScores as AvgScoreRow[])
    : [];
  const weakTopics = analyticsRes.success
    ? (analyticsRes.analytics.weakTopics as WeakTopicRow[])
    : [];

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-blue-600 mb-2">Master Console</h1>
        <p className="text-slate-600">System operation, telemetry, and user role management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toString()}
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Active Admins"
          value={activeAdmins.toString()}
          icon={<Shield className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Courses"
          value={snapshot.courses.toString()}
          icon={<Database className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Open Doubts"
          value={snapshot.openDoubts.toString()}
          icon={<Activity className="w-5 h-5 text-sky-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Average Course Scores</h2>
          </div>
          <div className="space-y-6">
            {avgScores.length === 0 ? (
              <p className="text-slate-500 text-sm">No course score data available yet.</p>
            ) : (
              avgScores.map((score) => (
                <div key={score.courseId} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">{score.courseName}</span>
                    <span className="text-sm font-bold text-blue-600">{score.averageScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full flex overflow-hidden border border-slate-200">
                    <div className="h-full bg-gradient-to-r from-blue-700 to-blue-400 rounded-full" style={{ width: `${Math.min(100, score.averageScore)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">{score.totalStudents} student{score.totalStudents !== 1 ? "s" : ""} tracking</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-slate-900">System-Wide Weak Topics</h2>
          </div>
          <div className="space-y-3">
            {weakTopics.length === 0 ? (
              <p className="text-slate-500 text-sm">No weak topics detected across the platform.</p>
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
