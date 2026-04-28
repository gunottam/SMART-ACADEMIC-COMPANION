"use client";

import { useState } from "react";
import { resolveDoubt } from "@/actions/doubts";
import { Loader2, MessageSquare, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/Toaster";

type DoubtRow = {
  _id: string;
  question: string;
  studentId?: { name?: string } | null;
  courseId?: { title?: string } | null;
  topicId?: { title?: string } | null;
};

export function TeacherDoubts({ initialDoubts }: { initialDoubts: DoubtRow[] }) {
  const [doubts, setDoubts] = useState<DoubtRow[]>(initialDoubts);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const answer = answers[id];
    if (!answer || !answer.trim()) return;
    
    setResolvingId(id);
    const res = await resolveDoubt(id, answer);
    if (res.success) {
      setDoubts(doubts.filter(d => d._id !== id));
      setAnswers(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (expandedId === id) setExpandedId(null);
      toast.success("Doubt resolved.");
    } else if (res.error) {
      toast.error(res.error);
    }
    setResolvingId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Doubt Inbox</h2>
            <p className="text-sm text-slate-600">Questions from students needing your attention</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-50 text-blue-900 text-xs font-bold rounded-full border border-blue-100">
          {doubts.length} Open
        </div>
      </div>

      <div className="space-y-3">
        {doubts.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">You are all caught up! No open doubts.</p>
          </div>
        ) : (
          <AnimatePresence>
            {doubts.map((doubt) => {
              const isExpanded = expandedId === doubt._id;
              
              return (
                <motion.div
                  key={doubt._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : doubt._id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white transition-colors text-left"
                  >
                    <div className="flex flex-col gap-1 pr-4">
                       <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                         {doubt.courseId?.title || "Unknown Course"} <span className="text-blue-300 mx-1">•</span> {doubt.topicId?.title || "Unknown Topic"}
                       </span>
                       <div className="text-sm font-medium text-slate-800 line-clamp-2">
                         <span className="text-slate-500 mr-2">{doubt.studentId?.name}:</span>
                         {doubt.question}
                       </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-200 bg-white"
                      >
                        <div className="p-4 space-y-4">
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700">
                             <span className="text-xs uppercase text-slate-500 font-bold block mb-1">Student&apos;s Question</span>
                             {doubt.question}
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-slate-600">Your Response</label>
                            <textarea
                              rows={3}
                              placeholder="Type your answer here..."
                              value={answers[doubt._id] || ""}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [doubt._id]: e.target.value }))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                            />
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={(e) => handleResolve(doubt._id, e)}
                                disabled={resolvingId === doubt._id || !answers[doubt._id]?.trim()}
                                className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                              >
                                {resolvingId === doubt._id && <Loader2 className="w-4 h-4 animate-spin" />}
                                Reply & Resolve
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
