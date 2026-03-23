"use client";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { Target, Search, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getStudentAnalytics } from "@/actions/student";

export default function AssessmentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getStudentAnalytics();
      if (res.success) setData(res.stats);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>;
  }

  const attempts = data?.recentAssessments || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50 tracking-tight mb-2">
            Assessments
          </h1>
          <p className="text-sm text-neutral-400">
            Your quiz history and scores from all enrolled courses.
          </p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Target className="w-8 h-8" />}
            title="No Assessments Yet"
            description="You haven't taken any quizzes yet. Enroll in a course and complete assessments to see your results here."
          />
        </div>
      ) : (
        <div className="pt-4">
          <h3 className="text-lg font-medium text-neutral-50 mb-6">Your Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attempts.map((attempt: any, i: number) => {
              const score = attempt.score || 0;
              const passed = score >= 70;
              const date = attempt.timestamp ? new Date(attempt.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

              return (
                <div key={i} className="flex flex-col p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-neutral-200 line-clamp-1 pr-4">Quiz #{i + 1}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{date}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xl font-semibold ${passed ? 'text-cyan-400' : 'text-red-400'}`}>{score}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/[0.02]">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                       <Clock className="w-3.5 h-3.5" />
                       {date}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${passed ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
