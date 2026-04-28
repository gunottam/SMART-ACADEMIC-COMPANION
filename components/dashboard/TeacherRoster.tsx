"use client";

import { useState } from "react";
import { Search, BookOpen, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RosterRow = {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  completionPercentage: number;
  averageScore: number;
  weakAreas: string[];
};

export function TeacherRoster({ initialData }: { initialData: RosterRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = initialData
    ? initialData.filter(
        (student) =>
          student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (!initialData || initialData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full min-h-[400px] bg-white border border-slate-200 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-sm"
      >
        <BookOpen className="w-16 h-16 text-blue-200 mb-6 animate-pulse" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">No Active Enrollments</h3>
        <p className="text-slate-600 max-w-md mx-auto leading-relaxed">When students enroll and interact with your courses, their analytical insights will map directly to this responsive pipeline seamlessly.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search students by name, email, or course..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-3xl border border-slate-200 bg-white backdrop-blur-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-5 text-xs font-bold text-slate-600 tracking-wider uppercase">Student Name</th>
              <th className="p-5 text-xs font-bold text-slate-600 tracking-wider uppercase">Course Enrolled</th>
              <th className="p-5 text-xs font-bold text-slate-600 tracking-wider uppercase text-center">Completion</th>
              <th className="p-5 text-xs font-bold text-slate-600 tracking-wider uppercase text-center">Avg Score</th>
              <th className="p-5 text-xs font-bold text-slate-600 tracking-wider uppercase">Flagged Weak Areas</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
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
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-5">
                      <div className="font-semibold text-slate-800">{row.studentName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{row.studentEmail}</div>
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-700">{row.courseName}</td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="text-xs font-bold text-blue-600">{row.completionPercentage}%</span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className="h-full bg-gradient-to-r from-blue-700 to-blue-400 rounded-full" style={{ width: `${row.completionPercentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                       <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold border ${row.averageScore >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                         {row.averageScore}%
                       </span>
                    </td>
                    <td className="p-5">
                      {row.weakAreas.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {row.weakAreas.map((topic: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 border border-rose-100 text-rose-900 text-[10px] uppercase font-bold tracking-wider">
                              <AlertTriangle className="w-3 h-3 text-rose-600" strokeWidth={2.5} />
                              {topic}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-2">
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
