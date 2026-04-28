"use client";

import { useEffect, useState } from "react";
import { getPendingSubmissions, gradeSubmission } from "@/actions/grading";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

export default function TeacherAssignmentsPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSub, setActiveSub] = useState<Record<string, unknown> | null>(null);
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");

  async function refreshSubmissions() {
    const res = await getPendingSubmissions();
    if (res.success) setData((res.submissions || []) as Record<string, unknown>[]);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getPendingSubmissions();
      if (cancelled) return;
      if (res.success) setData((res.submissions || []) as Record<string, unknown>[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGrade() {
    if (!activeSub) return;
    if (score === "") {
      toast.error("Please enter a valid score.");
      return;
    }

    const res = await gradeSubmission(activeSub._id as string, Number(score), feedback);
    if (res.success) {
      toast.success("Submission graded.");
      setActiveSub(null);
      setScore("");
      setFeedback("");
      await refreshSubmissions();
    } else {
      toast.error(res.error || "Grading failed.");
    }
  }

  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sub = activeSub as {
    _id: string;
    userId?: { name?: string };
    assignmentId?: { title?: string; maxScore?: number };
    content?: string;
    status?: string;
    score?: number;
    teacherFeedback?: string;
    submittedAt?: string;
  } | null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-600">Assignment Submissions</h1>
        <p className="text-sm text-slate-600">Review and grade your students&apos; recent uploads.</p>
      </div>

      {sub && (
        <div className="p-6 border border-blue-100 bg-blue-50/50 rounded-xl mb-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900 mb-2">Grading: {sub.userId?.name}</h2>
          <p className="text-sm text-slate-600 mb-4">
            {sub.assignmentId?.title} (Max: {sub.assignmentId?.maxScore})
          </p>
          <div className="bg-white p-4 rounded-lg text-slate-700 whitespace-pre-wrap text-sm border border-slate-200 mb-6">
            {sub.content}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Score</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))}
                max={sub.assignmentId?.maxScore}
                min={0}
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveSub(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGrade}
              className="px-4 py-2 bg-[#2563EB] text-white text-sm font-semibold rounded-md hover:bg-[#1d4ed8] transition-colors shadow-md shadow-blue-600/20"
            >
              Submit Grade
            </button>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="p-8 border border-slate-200/90 rounded-2xl text-center text-slate-500 bg-gradient-to-br from-[#fafcff] via-white to-[#eef4ff]/80 shadow-sm">
          No submissions found.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((row) => {
            const s = row as {
              _id: string;
              userId?: { name?: string };
              assignmentId?: { title?: string; maxScore?: number };
              submittedAt?: string;
              status?: string;
              score?: number;
              teacherFeedback?: string;
            };
            return (
              <div
                key={s._id}
                className="p-5 border border-slate-200 bg-white rounded-xl flex items-center justify-between shadow-sm"
              >
                <div>
                  <h3 className="font-medium text-slate-800">{s.userId?.name || "Unknown Student"}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{s.assignmentId?.title || "Untitled Assignment"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{" "}
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>

                {s.status === "graded" ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Graded: {s.score}/{s.assignmentId?.maxScore}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSub(row);
                      setScore(s.score ?? "");
                      setFeedback(s.teacherFeedback || "");
                    }}
                    className="px-4 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors border border-slate-200"
                  >
                    Review
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
