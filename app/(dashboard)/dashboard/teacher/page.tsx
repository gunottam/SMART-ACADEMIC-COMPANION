import { StatCard } from "@/components/dashboard/StatCard";
import { BookOpen, Users, Star, Activity } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import UserProgress from "@/models/UserProgress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-50 mb-2">Instructor Overview</h1>
        <p className="text-neutral-400">Welcome to your teaching console. Here's what's happening today.</p>
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
    </div>
  );
}
