"use client";

import { useEffect, useState } from "react";
import { getTeacherDoubts, resolveDoubt } from "@/actions/doubts";
import { Loader2, MessageSquare, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TeacherDoubts() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadDoubts();
  }, []);

  const loadDoubts = async () => {
    const res = await getTeacherDoubts();
    if (res.success) {
      setDoubts(res.doubts);
    }
    setLoading(false);
  };

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
    }
    setResolvingId(null);
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex justify-center items-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-2xl shadow-indigo-900/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-50">Doubt Inbox</h2>
            <p className="text-sm text-neutral-400">Questions from students needing your attention</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
          {doubts.length} Open
        </div>
      </div>

      <div className="space-y-3">
        {doubts.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
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
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden transition-colors"
                >
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : doubt._id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <div className="flex flex-col gap-1 pr-4">
                       <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                         {doubt.courseId?.title || "Unknown Course"} <span className="text-indigo-500/50 mx-1">•</span> {doubt.topicId?.title || "Unknown Topic"}
                       </span>
                       <div className="text-sm font-medium text-neutral-200 line-clamp-2">
                         <span className="text-neutral-500 mr-2">{doubt.studentId?.name}:</span>
                         {doubt.question}
                       </div>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/40"
                      >
                        <div className="p-4 space-y-4">
                          <div className="bg-white/5 p-4 rounded-lg border border-white/5 text-sm text-neutral-300">
                             <span className="text-xs uppercase text-neutral-500 font-bold block mb-1">Student's Question</span>
                             {doubt.question}
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-neutral-400">Your Response</label>
                            <textarea
                              rows={3}
                              placeholder="Type your answer here..."
                              value={answers[doubt._id] || ""}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [doubt._id]: e.target.value }))}
                              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 resize-y"
                            />
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={(e) => handleResolve(doubt._id, e)}
                                disabled={resolvingId === doubt._id || !answers[doubt._id]?.trim()}
                                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg disabled:opacity-50"
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
