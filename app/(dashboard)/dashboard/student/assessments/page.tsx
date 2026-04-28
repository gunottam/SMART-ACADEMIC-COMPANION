"use client";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { Target, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getStudentAnalytics } from "@/actions/student";
import { formatDate } from "@/lib/utils";

type Attempt = {
  assessmentId?: string;
  score: number;
  timestamp: string | Date;
};

export default function AssessmentsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getStudentAnalytics();
      if (res.success) {
        setAttempts((res.stats?.recentAssessments || []) as Attempt[]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-600 tracking-tight mb-2">
          Assessments
        </h1>
        <p className="text-sm text-slate-600">
          Your quiz history and scores from all enrolled courses.
        </p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon={<Target className="w-5 h-5" />}
          title="No assessments yet"
          description="Complete quizzes in your enrolled courses to see results here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attempts.map((attempt, i) => {
            const score = attempt.score || 0;
            const passed = score >= 70;
            const date = attempt.timestamp
              ? formatDate(attempt.timestamp)
              : "N/A";

            return (
              <div
                key={i}
                className="flex flex-col p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-100 hover:shadow-sm transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h4 className="font-medium text-slate-800 line-clamp-1 pr-4">
                      Attempt #{i + 1}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {date}
                    </p>
                  </div>
                  <span
                    className={`text-xl font-semibold tabular-nums ${
                      passed ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {score}%
                  </span>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${
                      passed
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                        : "text-red-700 bg-red-50 border border-red-100"
                    }`}
                  >
                    {passed ? "Passed" : "Below threshold"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
