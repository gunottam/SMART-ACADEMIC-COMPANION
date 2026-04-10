"use client";

import { useEffect, useState } from "react";
import { getPendingSubmissions, gradeSubmission } from "@/actions/grading";
import { Loader2, CheckCircle, Clock } from "lucide-react";

export default function TeacherAssignmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSub, setActiveSub] = useState<any | null>(null);
  const [score, setScore] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    setLoading(true);
    const res = await getPendingSubmissions();
    if (res.success) setData(res.submissions || []);
    setLoading(false);
  }

  async function handleGrade() {
    if (!activeSub) return;
    if (score === "") return alert("Please enter a valid score.");

    const res = await gradeSubmission(activeSub._id, Number(score), feedback);
    if (res.success) {
      alert("Submission Graded!");
      setActiveSub(null);
      setScore("");
      setFeedback("");
      loadSubmissions();
    } else {
      alert(res.error);
    }
  }

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">Assignment Submissions</h1>
        <p className="text-sm text-neutral-400">Review and grade your students' recent uploads.</p>
      </div>

      {activeSub && (
        <div className="p-6 border border-cyan-500/20 bg-cyan-500/5 rounded-xl mb-6">
          <h2 className="text-lg font-medium text-white mb-2">Grading: {activeSub.userId.name}</h2>
          <p className="text-sm text-neutral-300 mb-4">{activeSub.assignmentId.title} (Max: {activeSub.assignmentId.maxScore})</p>
          <div className="bg-neutral-900 p-4 rounded text-neutral-300 whitespace-pre-wrap text-sm border border-white/5 mb-6">
             {activeSub.content}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs text-neutral-400 mb-1">Score</label>
               <input type="number" value={score} onChange={(e) => setScore(e.target.value as any)} max={activeSub.assignmentId.maxScore} min={0} className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
             </div>
             <div>
               <label className="block text-xs text-neutral-400 mb-1">Feedback</label>
               <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" rows={3}></textarea>
             </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
             <button onClick={() => setActiveSub(null)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
             <button onClick={handleGrade} className="px-4 py-2 bg-cyan-500 text-black text-sm font-semibold rounded-md hover:bg-cyan-400 transition-colors">Submit Grade</button>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="p-8 border border-white/5 rounded-2xl text-center text-neutral-400">No submissions found.</div>
      ) : (
        <div className="space-y-4">
          {data.map((sub) => (
             <div key={sub._id} className="p-5 border border-white/10 bg-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-200">{sub.userId?.name || "Unknown Student"}</h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    <span>{sub.assignmentId?.title || "Untitled Assignment"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(sub.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {sub.status === "graded" ? (
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Graded: {sub.score}/{sub.assignmentId?.maxScore}</span>
                  </div>
                ) : (
                  <button onClick={() => { setActiveSub(sub); setScore(sub.score || ""); setFeedback(sub.teacherFeedback || ""); }} className="px-4 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors">Review</button>
                )}
             </div>
          ))}
        </div>
      )}
    </div>
  );
}