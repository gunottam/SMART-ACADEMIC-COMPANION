"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseWithCurriculum, startCourse, markTopicComplete, submitAssessment, submitAssignment } from "@/actions/student";
import { ArrowLeft, BookOpen, Loader2, PlayCircle, CheckCircle2, ChevronDown, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

export default function CourseViewer() {
  const params = useParams();
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Progress State
  const [progressData, setProgressData] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Assessment State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  const [assignmentSubmission, setAssignmentSubmission] = useState("");
  const [assignmentResult, setAssignmentResult] = useState<{ submitted: boolean } | null>(null);

  // State for the active viewing pane
  const [activeTopic, setActiveTopic] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      const res = await getCourseWithCurriculum(params.id as string);
      if (res.success) {
        setCourse(res.course);
        setCurriculum(res.curriculum);
        
        // Start course tracking
        const pRes = await startCourse(params.id as string);
        if (pRes.success) setProgressData(pRes.progress);
        
        // Auto-expand the first module and select its first topic by default
        if (res.curriculum.length > 0) {
          setExpandedModules({ [res.curriculum[0]._id]: true });
          if (res.curriculum[0].topics.length > 0) {
            setActiveTopic(res.curriculum[0].topics[0]);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  // Reset quiz when switching topics
  useEffect(() => {
    setQuizAnswers({});
    setQuizResult(null);
    setAssignmentSubmission("");
    setAssignmentResult(null);
  }, [activeTopic]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleCompleteTopic = async () => {
    if (!activeTopic || !course) return;
    setIsCompleting(true);
    
    const totalTopics = curriculum.reduce((acc, mod) => acc + mod.topics.length, 0);
    const res = await markTopicComplete(course._id, activeTopic._id, totalTopics);
    
    setIsCompleting(false);
    if (res.success) {
      setProgressData(res.progress);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeTopic?.assessment || !course) return;
    setIsCompleting(true);
    
    let correct = 0;
    activeTopic.assessment.questions.forEach((q: any, i: number) => {
      if (quizAnswers[i] === q.correctOptionIndex) correct++;
    });
    
    const score = Math.round((correct / activeTopic.assessment.questions.length) * 100);
    const passed = score >= (activeTopic.assessment.passingScore || 70);
    
    const totalTopics = curriculum.reduce((acc, mod) => acc + mod.topics.length, 0);
    const res = await submitAssessment(course._id, activeTopic._id, activeTopic.assessment._id, score, totalTopics);
    
    setIsCompleting(false);
    if (res.success) {
      setQuizResult({ score, passed });
      setProgressData(res.progress);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!activeTopic?.assignment || !course) return;
    setIsCompleting(true);
    
    const res = await submitAssignment(course._id, activeTopic.assignment._id, assignmentSubmission, "text");
    
    setIsCompleting(false);
    if (res.success) {
      setAssignmentResult({ submitted: true });
      // Assuming a server-side action to refresh next completion check handles this
      // But we will manually trigger state visual
    }
  };

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>;
  }

  if (!course) {
    return <div className="p-10 text-center text-red-400">Course not found or unauthorized.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] overflow-hidden m-4 border border-white/5 rounded-2xl bg-[#0A0A0A]">
      
      {/* Top Header */}
      <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student/courses" className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <h1 className="text-sm font-semibold text-neutral-200">{course.title}</h1>
            <p className="text-xs text-neutral-500">{course.instructorId?.name || "Instructor"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-400 bg-white/5 px-3 py-1.5 rounded-full">
            Progress: {progressData?.progress || 0}%
          </span>
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-cyan-400" style={{ width: `${progressData?.progress || 0}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar (Curriculum Tree) */}
        <div className="w-80 border-r border-white/5 flex flex-col bg-white/[0.01]">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Course Modules</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {curriculum.length === 0 ? (
              <p className="text-xs text-neutral-500">No modules mapped yet.</p>
            ) : (
              curriculum.map((mod: any, mIndex: number) => (
                <div key={mod._id} className="border border-white/5 rounded-lg overflow-hidden bg-black/20">
                  <button 
                    onClick={() => toggleModule(mod._id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-500/20">
                        {mIndex + 1}
                      </div>
                      <span className="text-sm font-medium text-neutral-200 truncate pr-4">{mod.title}</span>
                    </div>
                    {expandedModules[mod._id] ? <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />}
                  </button>
                  
                  {expandedModules[mod._id] && (
                    <div className="bg-black/40 p-2 space-y-1 border-t border-white/5">
                      {mod.topics.map((topic: any, tIndex: number) => {
                        const isActive = activeTopic?._id === topic._id;
                        const isCompleted = progressData?.completedTopics?.includes(topic._id);
                        
                        return (
                          <button
                            key={topic._id}
                            onClick={() => setActiveTopic(topic)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-colors ${
                              isActive 
                                ? 'bg-cyan-500/10 text-cyan-400' 
                                : 'hover:bg-white/5 text-neutral-400 hover:text-neutral-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                              <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-neutral-500'}`} />
                              <span className="text-xs font-medium truncate">
                                {mIndex + 1}.{tIndex + 1} {topic.title}
                              </span>
                            </div>
                            {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                      {mod.topics.length === 0 && (
                        <p className="text-[10px] text-neutral-600 px-3 py-1">No topics generated.</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content Pane (Topic Viewer) */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0A] relative">
          {activeTopic ? (
            <div className="max-w-3xl mx-auto py-12 px-8 pb-32">
              <div className="mb-8">
                <span className="text-cyan-400 text-sm font-medium mb-2 block">Current Topic</span>
                <h1 className="text-3xl font-bold text-white mb-4">{activeTopic.title}</h1>
                <div className="h-px w-24 bg-gradient-to-r from-cyan-400/50 to-transparent" />
              </div>
              
              <div className="prose prose-invert prose-emerald max-w-none text-neutral-300 leading-relaxed mb-16">
                {activeTopic.content.split('\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>

              {/* Quiz Render Block */}
              {activeTopic.assessment && (
                <div className="bg-white/[0.02] border border-cyan-500/20 rounded-2xl p-8 mb-12">
                  <h3 className="text-xl font-bold text-cyan-400 mb-6">{activeTopic.assessment.title}</h3>
                  
                  {quizResult ? (
                    <div className={`p-6 rounded-xl border ${quizResult.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-center`}>
                       <h4 className="text-2xl font-bold mb-2">{quizResult.score}% Score</h4>
                       <p className="text-sm">{quizResult.passed ? 'You passed this assessment! The topic has been marked complete.' : 'You did not meet the 70% passing requirement. Please review and try again.'}</p>
                       {!quizResult.passed && (
                         <button onClick={() => { setQuizResult(null); setQuizAnswers({}); }} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors">
                           Retake Assessment
                         </button>
                       )}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {activeTopic.assessment.questions.map((q: any, qIndex: number) => (
                        <div key={qIndex} className="space-y-4">
                           <p className="text-neutral-200 font-medium">{qIndex + 1}. {q.text}</p>
                           <div className="space-y-2">
                             {q.options.map((opt: string, optIndex: number) => (
                               <label key={optIndex} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${quizAnswers[qIndex] === optIndex ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-black/20 border-white/5 hover:bg-white/10'}`}>
                                 <input 
                                   type="radio"
                                   name={`question-${qIndex}`}
                                   checked={quizAnswers[qIndex] === optIndex}
                                   onChange={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                                   className="w-4 h-4 accent-cyan-500"
                                 />
                                 <span className="text-sm text-neutral-300">{opt}</span>
                               </label>
                             ))}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Assignment Render Block */}
              {activeTopic.assignment && (
                <div className="bg-white/[0.02] border border-amber-500/20 rounded-2xl p-8 mb-12 shadow-2xl shadow-amber-900/10">
                  <h3 className="text-xl font-bold text-amber-400 mb-2">{activeTopic.assignment.title}</h3>
                  <div className="flex gap-4 mb-6 text-xs font-medium text-amber-500/70">
                    <span>Max Score: {activeTopic.assignment.maxScore}</span>
                  </div>
                  <p className="text-neutral-300 text-sm mb-8 leading-relaxed bg-black/40 p-5 rounded-lg border border-white/5">
                    {activeTopic.assignment.description}
                  </p>
                  
                  {assignmentResult?.submitted || progressData?.assignmentSubmissions?.find((s:any) => s.assignmentId === activeTopic.assignment._id) ? (
                    <div className="p-6 rounded-xl border bg-amber-500/10 border-amber-500/20 text-amber-400 text-center transform transition-all duration-500">
                       <h4 className="text-lg font-bold mb-2">Assignment Submitted</h4>
                       <p className="text-sm text-amber-400/80">Your submission is pending review from the instructor.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Your Submission</label>
                      <textarea
                        rows={6}
                        placeholder="Write your submission here or paste a link..."
                        value={assignmentSubmission}
                        onChange={(e) => setAssignmentSubmission(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 resize-y transition-colors"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p>Select a topic from the curriculum to begin learning.</p>
            </div>
          )}

          {/* Sticky Bottom Bar for Topic Completion */}
          {activeTopic && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent">
              <div className="max-w-3xl mx-auto flex justify-end">
                {progressData?.completedTopics?.includes(activeTopic._id) ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm cursor-default">
                    <Check className="w-5 h-5" />
                    Completed
                  </div>
                ) : activeTopic.assessment && !quizResult?.passed ? (
                  <button 
                    onClick={handleSubmitQuiz}
                    disabled={isCompleting || Object.keys(quizAnswers).length !== activeTopic.assessment.questions.length}
                    className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all group shadow-lg shadow-cyan-500/10 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Submit Quiz
                  </button>
                ) : activeTopic.assignment && !assignmentResult?.submitted && !progressData?.assignmentSubmissions?.find((s:any) => s.assignmentId === activeTopic.assignment._id) ? (
                  <button 
                    onClick={handleSubmitAssignment}
                    disabled={isCompleting || !assignmentSubmission.trim()}
                    className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 px-8 py-3 rounded-xl text-sm font-bold tracking-wide transition-all group shadow-lg shadow-amber-500/10 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Submit Assignment
                  </button>
                ) : (
                  <button 
                    onClick={handleCompleteTopic}
                    disabled={isCompleting}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white border border-white/10 px-6 py-3 rounded-xl text-sm font-medium transition-all group shadow-lg backdrop-blur-sm disabled:opacity-50"
                  >
                    {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 opacity-50 group-hover:opacity-100" />}
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
