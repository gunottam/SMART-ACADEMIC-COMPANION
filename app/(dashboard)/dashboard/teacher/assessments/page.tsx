"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Target } from "lucide-react";
import { getTeacherCourses, addStandaloneAssessment, getTeacherAssessmentResults } from "@/actions/teacher";
import { toast } from "@/components/ui/Toaster";

export default function TeacherAssessmentsPage() {
  const [courses, setCourses] = useState<{ _id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], correctOptionIndex: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [generatedAssessments, setGeneratedAssessments] = useState<Record<string, unknown>[]>([]);
  const [attempts, setAttempts] = useState<Record<string, unknown>[]>([]);

  const loadResults = async () => {
    setResultsLoading(true);
    const res = await getTeacherAssessmentResults();
    if (res.success) {
      setGeneratedAssessments((res.assessments || []) as Record<string, unknown>[]);
      setAttempts((res.attempts || []) as Record<string, unknown>[]);
    }
    setResultsLoading(false);
  };

  useEffect(() => {
    async function load() {
      const res = await getTeacherCourses();
      if (res.success) {
        const list = (res.courses || []) as { _id: string; title: string }[];
        setCourses(list);
        if (list.length > 0) setCourseId(list[0]._id);
      }
      await loadResults();
      setLoading(false);
    }
    load();
  }, []);

  const addQuestion = () =>
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correctOptionIndex: 0 },
    ]);

  const updateQuestion = (i: number, field: string, val: unknown) => {
    const next = [...questions];
    (next[i] as Record<string, unknown>)[field] = val;
    setQuestions(next);
  };

  const updateOption = (qI: number, oI: number, val: string) => {
    const next = [...questions];
    next[qI].options[oI] = val;
    setQuestions(next);
  };

  const handleGenerate = async () => {
    if (!title || !courseId || questions.length === 0) {
      toast.error("Please fill all core fields.");
      return;
    }
    setSubmitting(true);
    const res = await addStandaloneAssessment({
      courseId,
      title,
      passingScore: Number(passingScore),
      questions,
    });
    setSubmitting(false);
    if (res.success) {
      toast.success("Assessment successfully bound to course!");
      setTitle("");
      setPassingScore("70");
      setQuestions([{ text: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);
      await loadResults();
    } else {
      toast.error(res.error || "Failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-600 mb-2 flex items-center gap-2">
          <Target className="text-blue-600 w-7 h-7" /> Assessment Generator
        </h1>
        <p className="text-slate-600">Generate standalone master assessments for a selected course.</p>
      </div>

      <div className="bg-white p-6 border border-slate-200 rounded-2xl space-y-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 mb-1">
              Target Subject / Course
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 mb-1">
              Assessment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              placeholder="Midterm Exam"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 mb-1">
              Passing Score (%)
            </label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              min={0}
              max={100}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="font-semibold text-blue-600">Quiz Questions</h3>
          {questions.map((q, qI) => (
            <div
              key={qI}
              className="p-4 border border-slate-200 bg-slate-50 rounded-xl space-y-4"
            >
              <div>
                <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
                  Question {qI + 1}
                </label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestion(qI, "text", e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                  placeholder="Question text..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oI) => (
                  <div
                    key={oI}
                    className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <input
                      type="radio"
                      name={`correct-${qI}`}
                      checked={q.correctOptionIndex === oI}
                      onChange={() => updateQuestion(qI, "correctOptionIndex", oI)}
                      className="accent-blue-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qI, oI, e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-slate-800"
                      placeholder={`Option ${oI + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={submitting}
            className="px-6 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg disabled:opacity-50 shadow-md shadow-blue-600/20"
          >
            {submitting ? "Generating..." : "Generate Assessment"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Generated Assessments</h2>
          {resultsLoading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Loading...
            </div>
          ) : generatedAssessments.length === 0 ? (
            <p className="text-slate-500 text-sm">No assessments generated yet.</p>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {generatedAssessments.map((a) => (
                <div
                  key={String(a._id)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{String(a.title)}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {String(a.courseTitle)} • {String(a.topicTitle)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Questions: {String(a.questionCount)} • Passing: {String(a.passingScore)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Student Attempts & Scores</h2>
          {resultsLoading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Loading...
            </div>
          ) : attempts.length === 0 ? (
            <p className="text-slate-500 text-sm">No student attempts yet.</p>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {attempts.map((a) => (
                <div
                  key={String(a.id)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {String(a.assessmentTitle)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {String(a.studentName)} ({String(a.studentEmail)})
                  </p>
                  <p className="text-xs text-slate-600">
                    {String(a.courseTitle)} • {String(a.topicTitle)}
                  </p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">Score: {String(a.score)}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
