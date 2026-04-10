"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Target } from "lucide-react";
import { getTeacherCourses, addStandaloneAssessment, getTeacherAssessmentResults } from "@/actions/teacher";

export default function TeacherAssessmentsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);

  // Generator form
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [questions, setQuestions] = useState([{ text: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [generatedAssessments, setGeneratedAssessments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);

  const loadResults = async () => {
    setResultsLoading(true);
    const res = await getTeacherAssessmentResults();
    if (res.success) {
      setGeneratedAssessments(res.assessments || []);
      setAttempts(res.attempts || []);
    }
    setResultsLoading(false);
  };

  useEffect(() => {
    async function load() {
      const res = await getTeacherCourses();
      if (res.success) {
        setCourses(res.courses || []);
        if (res.courses.length > 0) setCourseId(res.courses[0]._id);
      }
      await loadResults();
      setLoading(false);
    }
    load();
  }, []);

  const addQuestion = () => setQuestions([...questions, { text: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);

  const updateQuestion = (i: number, field: string, val: any) => {
    const next = [...questions];
    (next[i] as any)[field] = val;
    setQuestions(next);
  };

  const updateOption = (qI: number, oI: number, val: string) => {
    const next = [...questions];
    next[qI].options[oI] = val;
    setQuestions(next);
  };

  const handleGenerate = async () => {
    if (!title || !courseId || questions.length === 0) return alert("Please fill all core fields.");
    setSubmitting(true);
    const res = await addStandaloneAssessment({
      courseId,
      title,
      passingScore: Number(passingScore),
      questions
    });
    setSubmitting(false);
    if (res.success) {
       alert("Assessment successfully bound to course!");
       setTitle("");
       setPassingScore("70");
       setQuestions([{ text: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);
       await loadResults();
    } else {
       alert(res.error);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50 mb-2 flex items-center gap-2"><Target className="text-cyan-400"/> Assessment Generator</h1>
        <p className="text-neutral-400">Generate standalone master assessments for a selected course.</p>
      </div>

      <div className="bg-[#0A0A0A] p-6 border border-white/5 rounded-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">Target Subject / Course</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white">
               {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">Assessment Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white" placeholder="Midterm Exam" />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">Passing Score (%)</label>
            <input type="number" value={passingScore} onChange={e => setPassingScore(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white" min={0} max={100} />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="font-semibold text-emerald-400">Quiz Questions</h3>
          {questions.map((q, qI) => (
             <div key={qI} className="p-4 border border-white/5 bg-white/[0.02] rounded-xl space-y-4">
               <div>
                  <label className="block text-xs uppercase font-bold text-neutral-500 mb-1">Question {qI + 1}</label>
                  <input type="text" value={q.text} onChange={e => updateQuestion(qI, 'text', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm" placeholder="Question text..." />
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                 {q.options.map((opt, oI) => (
                   <div key={oI} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded px-3 py-1">
                     <input type="radio" name={`correct-${qI}`} checked={q.correctOptionIndex === oI} onChange={() => updateQuestion(qI, 'correctOptionIndex', oI)} />
                     <input type="text" value={opt} onChange={e => updateOption(qI, oI, e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-neutral-300" placeholder={`Option ${oI + 1}`} />
                   </div>
                 ))}
               </div>
             </div>
          ))}
          
          <button onClick={addQuestion} className="px-4 py-2 border border-white/10 text-neutral-400 rounded-md hover:bg-white/5 flex items-center gap-2 text-sm"><Plus className="w-4 h-4"/> Add Question</button>
        </div>

        <div className="pt-6 flex justify-end">
          <button onClick={handleGenerate} disabled={submitting} className="px-6 py-2 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 disabled:opacity-50">
             {submitting ? "Generating..." : "Generate Assessment"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] p-6 border border-white/5 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-100 mb-4">Generated Assessments</h2>
          {resultsLoading ? (
            <div className="flex items-center gap-2 text-neutral-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
          ) : generatedAssessments.length === 0 ? (
            <p className="text-neutral-500 text-sm">No assessments generated yet.</p>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {generatedAssessments.map((a) => (
                <div key={a._id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <p className="text-sm font-semibold text-neutral-100">{a.title}</p>
                  <p className="text-xs text-neutral-400 mt-1">{a.courseTitle} • {a.topicTitle}</p>
                  <p className="text-xs text-neutral-500 mt-1">Questions: {a.questionCount} • Passing: {a.passingScore}%</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0A0A0A] p-6 border border-white/5 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-100 mb-4">Student Attempts & Scores</h2>
          {resultsLoading ? (
            <div className="flex items-center gap-2 text-neutral-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
          ) : attempts.length === 0 ? (
            <p className="text-neutral-500 text-sm">No student attempts yet.</p>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {attempts.map((a) => (
                <div key={a.id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                  <p className="text-sm font-semibold text-neutral-100">{a.assessmentTitle}</p>
                  <p className="text-xs text-neutral-400 mt-1">{a.studentName} ({a.studentEmail})</p>
                  <p className="text-xs text-neutral-400">{a.courseTitle} • {a.topicTitle}</p>
                  <p className="text-xs text-emerald-400 mt-1">Score: {a.score}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
