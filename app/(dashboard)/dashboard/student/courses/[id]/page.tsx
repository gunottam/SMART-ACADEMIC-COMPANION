"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseWithCurriculum, startCourse, markTopicComplete, submitAssessment, submitAssignment } from "@/actions/student";
import { submitDoubt, getTopicDoubts } from "@/actions/doubts";
import { ArrowLeft, BookOpen, Loader2, PlayCircle, CheckCircle2, ChevronDown, ChevronRight, Check, Target } from "lucide-react";
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
  const [isRetaking, setIsRetaking] = useState(false);

  const [assignmentSubmission, setAssignmentSubmission] = useState("");
  const [assignmentResult, setAssignmentResult] = useState<{ submitted: boolean } | null>(null);

  // Doubt State
  const [doubtQuestion, setDoubtQuestion] = useState("");
  const [topicDoubts, setTopicDoubts] = useState<any[]>([]);
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);
  const [doubtSuccess, setDoubtSuccess] = useState(false);
  const [doubtError, setDoubtError] = useState("");

  // State for the active viewing pane
  const [activeTopic, setActiveTopic] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"content" | "assessment">("content");
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
        
        // Auto-expand all modules so newly generated assessments are immediately visible
        if (res.curriculum.length > 0) {
          const expanded = Object.fromEntries(res.curriculum.map((m: any) => [m._id, true]));
          setExpandedModules(expanded);

          const firstTopicModule = res.curriculum.find((m: any) => m.topics && m.topics.length > 0);
          if (firstTopicModule) {
            setActiveTopic(firstTopicModule.topics[0]);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  // Reset quiz when switching topics
  useEffect(() => {
    if (viewMode === "content" || viewMode === "assessment") {
      setQuizAnswers({});
      setQuizResult(null);
      setIsRetaking(false);
      setAssignmentSubmission("");
      setAssignmentResult(null);
      
      if (activeTopic) {
         getTopicDoubts(activeTopic._id).then(res => {
            if (res.success) setTopicDoubts(res.doubts || []);
         });
      }
    }
  }, [activeTopic, viewMode]);

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
      setIsRetaking(false);
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

  const handleAskDoubt = async () => {
    if (!activeTopic || !course || !doubtQuestion.trim()) return;
    setIsSubmittingDoubt(true);
    setDoubtError("");
    setDoubtSuccess(false);

    const res = await submitDoubt({
      courseId: course._id,
      topicId: activeTopic._id,
      question: doubtQuestion
    });

    setIsSubmittingDoubt(false);
    if (res.success) {
      setDoubtSuccess(true);
      setDoubtQuestion("");
      getTopicDoubts(activeTopic._id).then(r => setTopicDoubts(r.doubts || []));
      setTimeout(() => setDoubtSuccess(false), 3000);
    } else {
      setDoubtError(res.error || "Failed to submit doubt");
    }
  };

  const jumpToAssessment = () => {
    for (const mod of curriculum) {
      for (const topic of mod.topics) {
        if (topic.assessment) {
          setExpandedModules(prev => ({ ...prev, [mod._id]: true }));
          setActiveTopic(topic);
          setViewMode("assessment");
          return;
        }
      }
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
                        const isTopicActive = activeTopic?._id === topic._id && viewMode === "content";
                        const isAssessmentActive = activeTopic?._id === topic._id && viewMode === "assessment";
                        const isCompleted = progressData?.completedTopics?.includes(topic._id);
                        
                        return (
                          <div key={topic._id} className="space-y-1 my-1">
                            <button
                              onClick={() => { setActiveTopic(topic); setViewMode("content"); }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-colors ${
                                isTopicActive 
                                  ? 'bg-cyan-500/10 text-cyan-400' 
                                  : 'hover:bg-white/5 text-neutral-400 hover:text-neutral-200'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${isTopicActive ? 'text-cyan-400' : 'text-neutral-500'}`} />
                                <span className="text-xs font-medium truncate">
                                  {mIndex + 1}.{tIndex + 1} {topic.title}
                                </span>
                              </div>
                              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                            </button>
                            
                            {topic.assessment && (
                              <button
                                onClick={() => { setActiveTopic(topic); setViewMode("assessment"); }}
                                className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-colors pl-8 ${
                                  isAssessmentActive 
                                    ? 'bg-indigo-500/10 text-indigo-400 border-l border-indigo-500/50' 
                                    : 'hover:bg-white/5 text-neutral-500 hover:text-neutral-300 border-l border-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                  <Target className={`w-3.5 h-3.5 shrink-0 ${isAssessmentActive ? 'text-indigo-400' : 'text-neutral-600'}`} />
                                  <span className="text-[11px] font-medium uppercase tracking-wider truncate">
                                    Assessment Task
                                  </span>
                                </div>
                                {progressData?.assessmentAttempts?.find((a: any) => a.assessmentId === topic.assessment._id)?.score >= (topic.assessment.passingScore || 70) && (
                                  <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-2" />
                                )}
                              </button>
                            )}
                          </div>
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
        <div className="flex-1 overflow-y-auto bg-[#0A0A0A] relative flex flex-col">
          {activeTopic ? (
             viewMode === "content" ? (
            <div className="max-w-3xl w-full mx-auto py-12 px-8 flex-1">
              <div className="mb-8">
                <span className="text-cyan-400 text-sm font-medium mb-2 block">Current Topic</span>
                <h1 className="text-3xl font-bold text-white mb-4">{activeTopic.title}</h1>
                <div className="h-px w-24 bg-gradient-to-r from-cyan-400/50 to-transparent" />
              </div>
              
              <div className="prose prose-invert prose-emerald max-w-none text-neutral-300 leading-relaxed mb-16">
                {activeTopic.content ? activeTopic.content.split('\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                )) : (
                  <p className="text-neutral-500 italic">No content generated for this topic yet.</p>
                )}
              </div>

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
                      <textarea
                        rows={6}
                        placeholder="Write your submission here or paste a link..."
                        value={assignmentSubmission}
                        onChange={(e) => setAssignmentSubmission(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 resize-y transition-colors"
                      />
                      <div className="flex justify-end pt-2">
                        <button 
                          onClick={handleSubmitAssignment}
                          disabled={isCompleting || !assignmentSubmission.trim()}
                          className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/30 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all group shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Doubt Forum / QA Board */}
              <div className="bg-white/[0.02] border border-indigo-500/20 rounded-2xl p-8 mb-6 shadow-2xl shadow-indigo-900/10">
                <h3 className="text-xl font-bold text-indigo-400 mb-2">Resolved Doubts</h3>
                <p className="text-neutral-400 text-sm mb-6">See answered questions from this topic below.</p>
                {topicDoubts.length > 0 ? (
                  <div className="space-y-4">
                    {topicDoubts.map((d: any) => (
                      <div key={d._id} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5 shadow-inner">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-neutral-300 flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                              Question by {d.studentId?.name || "Student"}:
                            </h4>
                            <p className="text-sm text-neutral-400 pl-4 border-l-2 border-white/5 mb-4">{d.question}</p>
                            
                            {d.answer && (
                              <>
                                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Instructor Answer:
                                </h4>
                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
                                  <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">{d.answer}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                    <p className="text-neutral-500 text-sm">No resolved doubts for this topic yet.</p>
                  </div>
                )}
              </div>

              {/* Ask a Doubt Block */}
              <div className="bg-white/[0.02] border border-cyan-500/20 rounded-2xl p-8 mb-12 shadow-2xl shadow-cyan-900/10">
                <h3 className="text-xl font-bold text-cyan-400 mb-2">Ask a Doubt</h3>
                <p className="text-neutral-400 text-sm mb-6">Stuck on this topic? Ask your instructor for help.</p>
                <div className="space-y-4">
                  <textarea
                    rows={4}
                    placeholder="Type your question here..."
                    value={doubtQuestion}
                    onChange={(e) => setDoubtQuestion(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 resize-y transition-colors"
                  />
                  <div className="flex justify-end gap-4 items-center">
                    {doubtSuccess && (
                       <span className="text-emerald-400 text-sm font-medium">Doubt submitted successfully!</span>
                    )}
                    {doubtError && (
                       <span className="text-red-400 text-sm font-medium">{doubtError}</span>
                    )}
                    <button
                      onClick={handleAskDoubt}
                      disabled={isSubmittingDoubt || !doubtQuestion.trim()}
                      className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-sm font-bold tracking-wide transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmittingDoubt && <Loader2 className="w-4 h-4 animate-spin" />}
                      Submit Question
                    </button>
                  </div>
                </div>
              </div>

            </div>
             ) : (
            <div className="max-w-4xl mx-auto py-12 px-8 pb-32">
              <div className="mb-8">
                <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded border border-indigo-500/20 mb-4 inline-block">Assessment Task</span>
                <h1 className="text-3xl font-bold text-white mb-4">{activeTopic.assessment.title}</h1>
                <p className="text-sm text-neutral-400 font-medium">Testing competency for: <span className="text-neutral-200">{activeTopic.title}</span></p>
                <div className="h-px w-24 bg-gradient-to-r from-indigo-400/50 to-transparent mt-6" />
              </div>
              
              {(() => {
                    const previousAttempt = progressData?.assessmentAttempts?.find((a: any) => a.assessmentId === activeTopic.assessment._id);
                    const activeScore = quizResult ? quizResult.score : previousAttempt?.score;
                    const isPassed = quizResult ? quizResult.passed : (activeScore >= (activeTopic.assessment.passingScore || 70));
                    const hasResult = activeScore !== undefined && activeScore !== null;
                    const isSubmissionView = (quizResult || hasResult) && !isRetaking;

                    if (isSubmissionView) {
                      return (
                        <div className={`p-8 rounded-xl border ${isPassed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-center shadow-inner mt-8`}>
                           <h4 className="text-3xl font-bold mb-4">{activeScore}% Score</h4>
                           
                           {/* The Assessment Score Bar */}
                           <div className="w-full bg-black/60 rounded-full h-4 mb-6 overflow-hidden border border-white/10 mx-auto max-w-lg shadow-inner relative">
                             <div 
                               className={`h-full transition-all duration-1000 ease-out ${isPassed ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`} 
                               style={{ width: `${activeScore}%` }} 
                             />
                           </div>
                           
                           <p className="text-sm font-medium text-white/80">
                             {isPassed ? 'You passed this assessment! The core topic has been marked complete.' : 'You did not meet the 70% passing requirement. Please review the topic and try again.'}
                           </p>
                           {!isPassed && (
                             <button onClick={() => { setQuizResult(null); setQuizAnswers({}); setIsRetaking(true); }} className="mt-8 px-8 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg">
                               Retake Assessment
                             </button>
                           )}
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-8 mt-8">
                        {activeTopic.assessment.questions.map((q: any, qIndex: number) => (
                          <div key={qIndex} className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-4">
                             <p className="text-neutral-200 font-medium">{qIndex + 1}. {q.text}</p>
                             <div className="space-y-2">
                               {q.options.map((opt: string, optIndex: number) => (
                                 <label key={optIndex} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${quizAnswers[qIndex] === optIndex ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] text-indigo-200' : 'bg-black/40 border-white/5 hover:bg-white/10 text-neutral-300'}`}>
                                   <input 
                                     type="radio"
                                     name={`question-${qIndex}`}
                                     checked={quizAnswers[qIndex] === optIndex}
                                     onChange={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                                     className="w-4 h-4 accent-indigo-500"
                                   />
                                   <span className="text-sm">{opt}</span>
                                 </label>
                               ))}
                             </div>
                          </div>
                        ))}
                        
                        {/* Native Submit Button inside the Assessment block */}
                        <div className="pt-8 flex justify-end">
                           <button 
                             onClick={handleSubmitQuiz}
                             disabled={isCompleting || Object.keys(quizAnswers).length !== activeTopic.assessment.questions.length}
                             className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 text-white px-10 py-4 rounded-full text-base font-bold transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                           >
                             {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                             Submit Assessment Profile
                           </button>
                        </div>
                      </div>
                    )
                  })()}
             </div>
             )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p>Select a topic from the curriculum to begin learning.</p>
            </div>
          )}

          {/* Sticky Bottom Bar for Topic Completion */}
          {activeTopic && viewMode === "content" && (
            <div className="sticky bottom-0 left-0 right-0 p-6 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-white/5 z-20 mt-8 w-full">
              <div className="max-w-3xl mx-auto flex justify-end">
                {progressData?.completedTopics?.includes(activeTopic._id) ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm cursor-default">
                    <Check className="w-5 h-5" />
                    Completed
                  </div>
                ) : activeTopic.assessment ? (
                  <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-6 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm cursor-default">
                    <Target className="w-5 h-5" />
                    Pass Assessment to Complete
                  </div>
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

      {/* Floating Action Button */}
      {(!activeTopic || !activeTopic.assessment) && curriculum.some(m => m.topics.some((t: any) => t.assessment)) && (
        <button
          onClick={jumpToAssessment}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3.5 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.4)] font-semibold transition-all hover:-translate-y-1 active:scale-95"
        >
          <Target className="w-5 h-5" />
          Take Assessment
        </button>
      )}
    </div>
  );
}
