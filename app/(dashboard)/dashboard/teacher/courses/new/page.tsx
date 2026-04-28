"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createCourse } from "@/actions/teacher";
import { useRouter } from "next/navigation";
import { StaggerWrapper } from "@/components/ui/StaggerWrapper";

export default function CourseBuilderPage() {
  // We will manage form state here for Course -> Modules -> Topics
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    status: "published"
  });
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateCourse = async () => {
    if (!formData.title || !formData.description) return alert("Title and Description required.");
    
    setLoading(true);
    const result = await createCourse({
      title: formData.title,
      description: formData.description,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      status: formData.status,
      modules: modules
    });
    setLoading(false);
    
    if (result.success) {
      router.push("/dashboard/teacher/courses");
    } else {
      alert("Failed: " + result.error);
    }
  };

  const tabs = [
    { id: "details", label: "Course Details" },
    { id: "curriculum", label: "Curriculum Builder" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/teacher/courses" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">Course Builder</h1>
        <p className="text-slate-600">Design and publish a new learning pathway.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-blue-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Builder Surface */}
      <StaggerWrapper className="rounded-2xl border border-blue-100 bg-slate-50 backdrop-blur-2xl p-8 min-h-[500px] shadow-2xl shadow-sm">
        {activeTab === "details" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Advanced System Design"
                className="w-full bg-white/5 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What will students learn in this course?"
                className="w-full bg-white/5 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tags (Comma separated)</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="e.g., computer science, architecture, networking"
                className="w-full bg-white/5 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div className="pt-4">
              <button 
                onClick={() => setActiveTab("curriculum")}
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800">Course Modules</h3>
                <p className="text-sm text-slate-500">Organize your course into modules and topics.</p>
              </div>
              <button 
                onClick={() => setModules([...modules, { id: Date.now().toString(), title: "", description: "", topics: [] }])}
                className="bg-white/5 hover:bg-white/10 text-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200"
              >
                + Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-[200px] border border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-500 mb-4">No modules added yet.</p>
                <button 
                  onClick={() => setModules([{ id: Date.now().toString(), title: "", description: "", topics: [] }])}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create your first module
                </button>
              </div>
            ) : (
              <StaggerWrapper className="space-y-6">
                {modules.map((mod, mIndex) => (
                  <div key={mod.id} className="border border-blue-100 rounded-xl p-6 bg-slate-100 backdrop-blur-md shadow-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 space-y-3 mr-4">
                        <input 
                          type="text" 
                          placeholder="Module Title (e.g. Introduction to React)" 
                          value={mod.title}
                          onChange={(e) => {
                            const newM = [...modules];
                            newM[mIndex].title = e.target.value;
                            setModules(newM);
                          }}
                          className="w-full bg-transparent border-b border-slate-200 pb-2 text-lg font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <button 
                        onClick={() => setModules(modules.filter((_, i) => i !== mIndex))}
                        className="text-red-400 hover:text-red-300 text-sm font-medium px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Topics */}
                    <div className="mt-6 space-y-3 pl-4 border-l-2 border-slate-200">
                      {mod.topics.map((topic: any, tIndex: number) => (
                        <div key={topic.id} className="bg-white/5 border border-slate-200 rounded-lg p-4 space-y-3 relative group">
                          <button 
                            onClick={() => {
                              const newM = [...modules];
                              newM[mIndex].topics = newM[mIndex].topics.filter((_: any, i: number) => i !== tIndex);
                              setModules(newM);
                            }}
                            className="absolute right-4 top-4 text-slate-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove Topic
                          </button>
                          <div>
                            <input 
                              type="text" 
                              placeholder="Topic Title" 
                              value={topic.title}
                              onChange={(e) => {
                                const newM = [...modules];
                                newM[mIndex].topics[tIndex].title = e.target.value;
                                setModules(newM);
                              }}
                              className="w-full md:w-3/4 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none mb-3"
                            />
                            <textarea
                              placeholder="Write your topic content here... (Markdown supported)"
                              rows={4}
                              value={topic.content}
                              onChange={(e) => {
                                const newM = [...modules];
                                newM[mIndex].topics[tIndex].content = e.target.value;
                                setModules(newM);
                              }}
                              className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 resize-y"
                            />

                            <div className="flex flex-wrap items-center gap-4 mt-2 mb-2">
                              {!topic.assessment && (
                                <button
                                  onClick={() => {
                                    const newM = [...modules];
                                    newM[mIndex].topics[tIndex].assessment = {
                                      title: "Topic Quiz",
                                      questions: [{ text: "", options: ["", "", "", ""], correctOptionIndex: 0 }]
                                    };
                                    setModules(newM);
                                  }}
                                  className="text-[11px] uppercase tracking-wider text-blue-600 hover:text-blue-600 font-bold transition-colors"
                                >
                                  + Add Interactive Quiz
                                </button>
                              )}
                              {!topic.assignment && (
                                <button
                                  onClick={() => {
                                    const newM = [...modules];
                                    newM[mIndex].topics[tIndex].assignment = {
                                      title: "",
                                      description: "",
                                      maxScore: 100
                                    };
                                    setModules(newM);
                                  }}
                                  className="text-[11px] uppercase tracking-wider text-[#2563EB] hover:text-[#1d4ed8] font-bold transition-colors"
                                >
                                  + Add Assignment
                                </button>
                              )}
                            </div>
                            {topic.assessment && (
                              <div className="mt-4 p-4 border border-blue-100 bg-blue-50 rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                  <input 
                                    className="bg-transparent text-sm font-semibold text-blue-600 placeholder-slate-400 focus:outline-none flex-1"
                                    placeholder="Quiz Title"
                                    value={topic.assessment.title}
                                    onChange={(e) => {
                                      const newM = [...modules];
                                      newM[mIndex].topics[tIndex].assessment.title = e.target.value;
                                      setModules(newM);
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      const newM = [...modules];
                                      delete newM[mIndex].topics[tIndex].assessment;
                                      setModules(newM);
                                    }}
                                    className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 tracking-wider"
                                  >
                                    Remove Quiz
                                  </button>
                                </div>
                                {topic.assessment.questions.map((q: any, qIndex: number) => (
                                  <div key={qIndex} className="space-y-3 p-4 bg-white rounded-md border border-slate-200">
                                    <input 
                                      placeholder="Question Text (e.g. What is the capital of React?)"
                                      className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none pb-2 border-b border-slate-200 focus:border-blue-500/50"
                                      value={q.text}
                                      onChange={(e) => {
                                        const newM = [...modules];
                                        newM[mIndex].topics[tIndex].assessment.questions[qIndex].text = e.target.value;
                                        setModules(newM);
                                      }}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                      {q.options.map((opt: string, optIndex: number) => (
                                        <div key={optIndex} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                                          <input 
                                            type="radio"
                                            name={`q-${mIndex}-${tIndex}-${qIndex}`}
                                            checked={q.correctOptionIndex === optIndex}
                                            onChange={() => {
                                              const newM = [...modules];
                                              newM[mIndex].topics[tIndex].assessment.questions[qIndex].correctOptionIndex = optIndex;
                                              setModules(newM);
                                            }}
                                            className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                                          />
                                          <input 
                                            placeholder={`Option ${optIndex + 1}`}
                                            className="flex-1 bg-transparent text-xs text-slate-700 focus:outline-none placeholder-slate-400"
                                            value={opt}
                                            onChange={(e) => {
                                              const newM = [...modules];
                                              newM[mIndex].topics[tIndex].assessment.questions[qIndex].options[optIndex] = e.target.value;
                                              setModules(newM);
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    {topic.assessment.questions.length > 1 && (
                                       <div className="flex justify-end pt-2">
                                        <button 
                                          onClick={() => {
                                            const newM = [...modules];
                                            newM[mIndex].topics[tIndex].assessment.questions.splice(qIndex, 1);
                                            setModules(newM);
                                          }}
                                          className="text-[10px] font-bold text-red-500/70 hover:text-red-400 uppercase tracking-widest"
                                        >
                                          Delete
                                        </button>
                                       </div>
                                    )}
                                  </div>
                                ))}
                                <button 
                                  onClick={() => {
                                    const newM = [...modules];
                                    newM[mIndex].topics[tIndex].assessment.questions.push({ text: "", options: ["", "", "", ""], correctOptionIndex: 0 });
                                    setModules(newM);
                                  }}
                                  className="text-[11px] font-bold tracking-wider text-blue-600 hover:text-blue-800 uppercase mt-2"
                                >
                                  + Next Question
                                </button>
                              </div>
                            )}

                            {/* ASSIGNMENT BLOCK */}
                            {topic.assignment && (
                              <div className="mt-4 p-4 border border-blue-100 bg-blue-50/80 rounded-lg space-y-4 relative">
                                <div className="flex justify-between items-center">
                                  <input 
                                    className="bg-transparent text-sm font-semibold text-[#2563EB] placeholder-slate-400 focus:outline-none flex-1"
                                    placeholder="Assignment Title"
                                    value={topic.assignment.title}
                                    onChange={(e) => {
                                      const newM = [...modules];
                                      newM[mIndex].topics[tIndex].assignment.title = e.target.value;
                                      setModules(newM);
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      const newM = [...modules];
                                      delete newM[mIndex].topics[tIndex].assignment;
                                      setModules(newM);
                                    }}
                                    className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 tracking-wider"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <textarea
                                  placeholder="Assignment Instructions..."
                                  rows={2}
                                  value={topic.assignment.description}
                                  onChange={(e) => {
                                    const newM = [...modules];
                                    newM[mIndex].topics[tIndex].assignment.description = e.target.value;
                                    setModules(newM);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/60 resize-y"
                                />
                                <div className="bg-white border border-slate-200 rounded-md px-3 py-2 max-w-[150px]">
                                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Max Score</label>
                                  <input 
                                    type="number"
                                    className="bg-transparent text-sm text-slate-800 focus:outline-none w-full"
                                    value={topic.assignment.maxScore}
                                    onChange={(e) => {
                                      const newM = [...modules];
                                      newM[mIndex].topics[tIndex].assignment.maxScore = Number(e.target.value);
                                      setModules(newM);
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newM = [...modules];
                          newM[mIndex].topics.push({ id: Date.now().toString() + Math.random(), title: "", content: "" });
                          setModules(newM);
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-4 inline-flex items-center gap-1"
                      >
                        + Add Topic
                      </button>
                    </div>
                  </div>
                ))}
              </StaggerWrapper>
            )}
            
            <div className="pt-6 border-t border-slate-200 mt-8 relative z-10">
              <button 
                onClick={() => setActiveTab("settings")}
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Continue to Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
              <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-white/5 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>
            <div className="pt-4 border-t border-slate-200 mt-8">
              <button 
                onClick={handleCreateCourse}
                disabled={loading}
                className="flex justify-center items-center w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Course"}
              </button>
            </div>
          </div>
        )}
      </StaggerWrapper>
    </div>
  );
}
