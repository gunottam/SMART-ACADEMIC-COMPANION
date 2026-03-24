"use client";

import { useState } from "react";
import { Search, BookOpen, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TeacherRoster({ initialData }: { initialData: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = initialData ? initialData.filter((student) => 
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (!initialData || initialData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full min-h-[400px] bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-8 text-center"
      >
        <BookOpen className="w-16 h-16 text-neutral-600 mb-6 animate-pulse" />
        <h3 className="text-2xl font-bold text-neutral-200 mb-2 tracking-tight">No Active Enrollments</h3>
        <p className="text-neutral-500 max-w-md mx-auto leading-relaxed">When students enroll and interact with your courses, their analytical insights will map directly to this responsive pipeline seamlessly.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input 
          type="text" 
          placeholder="Search students by name, email, or course..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-3xl border border-white/10 bg-[#00000040] backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/10">
              <th className="p-5 text-xs font-bold text-neutral-400 tracking-wider uppercase">Student Name</th>
              <th className="p-5 text-xs font-bold text-neutral-400 tracking-wider uppercase">Course Enrolled</th>
              <th className="p-5 text-xs font-bold text-neutral-400 tracking-wider uppercase text-center">Completion</th>
              <th className="p-5 text-xs font-bold text-neutral-400 tracking-wider uppercase text-center">Avg Score</th>
              <th className="p-5 text-xs font-bold text-neutral-400 tracking-wider uppercase">Flagged Weak Areas</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-500 font-medium">
                    No matching students found within this tenant boundary.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <motion.tr 
                    key={row.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05, ease: "easeOut" }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-5">
                      <div className="font-semibold text-neutral-200">{row.studentName}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{row.studentEmail}</div>
                    </td>
                    <td className="p-5 text-sm font-medium text-neutral-300">{row.courseName}</td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-400">{row.completionPercentage}%</span>
                        <div className="w-20 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${row.completionPercentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                       <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold border ${row.averageScore >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'}`}>
                         {row.averageScore}%
                       </span>
                    </td>
                    <td className="p-5">
                      {row.weakAreas.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {row.weakAreas.map((topic: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-[10px] uppercase font-bold tracking-wider">
                              <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                              {topic}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-600 font-medium tracking-wide flex items-center gap-2">
                           —
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
