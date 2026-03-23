"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { getCourseForEdit, updateCourseWithCurriculum } from "@/actions/teacher";
import { useRouter } from "next/navigation";
import { StaggerWrapper } from "@/components/ui/StaggerWrapper";

export default function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    status: "draft"
  });
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const res = await getCourseForEdit(resolvedParams.id);
      if (res.success && res.course) {
        setFormData({
          title: res.course.title,
          description: res.course.description,
          tags: res.course.tags.join(", "),
          status: res.course.status
        });
        setModules(res.curriculum || []);
      }
      setLoading(false);
    }
    loadData();
  }, [resolvedParams.id]);

  const handleUpdateCourse = async () => {
    if (!formData.title || !formData.description) return alert("Title and Description required.");
    
    setSaving(true);
    const result = await updateCourseWithCurriculum(resolvedParams.id, {
      title: formData.title,
      description: formData.description,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      status: formData.status,
      modules: modules
    });
    setSaving(false);
    
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/teacher/courses" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <h1 className="text-3xl font-semibold text-neutral-50 mb-2">Edit Course</h1>
        <p className="text-neutral-400">Modify your existing curriculum structure safely.</p>
      </div>

      <div className="flex items-center gap-6 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? "text-emerald-400" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-emerald-400"
              />
            )}
          </button>
        ))}
      </div>

      <StaggerWrapper className="rounded-2xl border border-emerald-500/20 bg-black/20 backdrop-blur-2xl p-8 min-h-[500px] shadow-2xl shadow-emerald-900/10 relative">
        {activeTab === "details" && (
          <div className="space-y-6 max-w-2xl text-left">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Course Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Tags</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="pt-4">
              <button 
                onClick={() => setActiveTab("curriculum")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-neutral-200">Course Curriculum</h3>
              </div>
              <button 
                onClick={() => setModules([...modules, { id: Date.now().toString(), title: "", description: "", topics: [] }])}
                className="bg-white/5 hover:bg-white/10 text-neutral-200 px-4 py-2 rounded-lg text-sm font-medium border border-white/10"
              >
                + Add Module
              </button>
            </div>

            {modules.length === 0 ? (
               <p className="text-neutral-500">No modules present.</p>
            ) : (
              <StaggerWrapper className="space-y-6">
                {modules.map((mod, mIndex) => (
                  <div key={mod.id || mod._id} className="border border-cyan-500/20 rounded-xl p-6 bg-black/40 backdrop-blur-md shadow-2xl shadow-cyan-900/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 space-y-3 mr-4">
                        <input 
                          type="text" 
                          placeholder="Module Title" 
                          value={mod.title}
                          onChange={(e) => {
                            const newM = [...modules];
                            newM[mIndex].title = e.target.value;
                            setModules(newM);
                          }}
                          className="w-full bg-transparent border-b border-white/10 pb-2 text-lg font-medium text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <button 
                        onClick={() => setModules(modules.filter((_, i) => i !== mIndex))}
                        className="text-red-400 hover:text-red-300 text-sm font-medium px-2 py-1"
                      >
                        Delete Module
                      </button>
                    </div>

                    <div className="mt-6 space-y-3 pl-4 border-l-2 border-white/5">
                      {mod.topics?.map((topic: any, tIndex: number) => (
                        <div key={topic.id || topic._id} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 relative group">
                          <button 
                            onClick={() => {
                              const newM = [...modules];
                              newM[mIndex].topics = newM[mIndex].topics.filter((_: any, i: number) => i !== tIndex);
                              setModules(newM);
                            }}
                            className="absolute right-4 top-4 text-neutral-500 hover:text-red-400 text-xs transition-opacity"
                          >
                            Remove
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
                              className="w-full md:w-3/4 bg-transparent text-sm font-medium text-neutral-200 focus:outline-none mb-3"
                            />
                            <textarea
                              rows={4}
                              value={topic.content}
                              onChange={(e) => {
                                const newM = [...modules];
                                newM[mIndex].topics[tIndex].content = e.target.value;
                                setModules(newM);
                              }}
                              className="w-full bg-black/40 border border-white/5 rounded-md px-3 py-2 text-sm text-neutral-300 md:resize-y focus:outline-none focus:border-emerald-500/50"
                            />

                            <div className="flex flex-wrap items-center gap-4 mt-2 mb-2">
                              {!topic.assessment && (
                                <button
                                  onClick={() => {
                                    const newM = [...modules];
                                    newM[mIndex].topics[tIndex].assessment = { title: "Topic Quiz", questions: [{ text: "", options: ["", "", "", ""], correctOptionIndex: 0 }] };
                                    setModules(newM);
                                  }}
                                  className="text-[11px] uppercase text-cyan-500 font-bold"
                                >
                                  + Quiz
                                </button>
                              )}
                              {!topic.assignment && (
                                <button
                                  onClick={() => {
                                    const newM = [...modules];
                                    newM[mIndex].topics[tIndex].assignment = { title: "", description: "", maxScore: 100 };
                                    setModules(newM);
                                  }}
                                  className="text-[11px] uppercase text-amber-500 font-bold"
                                >
                                  + Assignment
                                </button>
                              )}
                            </div>

                            {topic.assessment && (
                              <div className="mt-4 p-4 border border-cyan-500/20 bg-cyan-950/20 rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                  <input 
                                    className="bg-transparent text-sm font-semibold text-cyan-400 focus:outline-none flex-1"
                                    value={topic.assessment.title}
                                    onChange={(e) => {
                                      const newM = [...modules];
                                      newM[mIndex].topics[tIndex].assessment.title = e.target.value;
                                      setModules(newM);
                                    }}
                                  />
                                  <button onClick={() => { const newM = [...modules]; delete newM[mIndex].topics[tIndex].assessment; setModules(newM); }} className="text-[10px] text-red-400 font-bold uppercase">Remove</button>
                                </div>
                                {topic.assessment.questions.map((q: any, qIndex: number) => (
                                  <div key={qIndex} className="p-4 bg-[#0A0A0A] border border-white/5 space-y-3">
                                    <input 
                                      className="w-full bg-transparent text-sm focus:outline-none border-b border-white/5 pb-2"
                                      value={q.text}
                                      onChange={(e) => { const newM = [...modules]; newM[mIndex].topics[tIndex].assessment.questions[qIndex].text = e.target.value; setModules(newM); }}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                      {q.options.map((opt: string, optIndex: number) => (
                                        <div key={optIndex} className="flex gap-2 bg-white/[0.02] p-2 border border-white/5">
                                          <input type="radio" checked={q.correctOptionIndex === optIndex} onChange={() => { const newM = [...modules]; newM[mIndex].topics[tIndex].assessment.questions[qIndex].correctOptionIndex = optIndex; setModules(newM); }} />
                                          <input className="bg-transparent flex-1 text-xs focus:outline-none" value={opt} onChange={(e) => { const newM = [...modules]; newM[mIndex].topics[tIndex].assessment.questions[qIndex].options[optIndex] = e.target.value; setModules(newM); }} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                <button onClick={() => { const newM = [...modules]; newM[mIndex].topics[tIndex].assessment.questions.push({ text: "", options: ["", "", "", ""], correctOptionIndex: 0 }); setModules(newM); }} className="text-[11px] text-emerald-400 font-bold uppercase">+ Next Question</button>
                              </div>
                            )}

                            {topic.assignment && (
                              <div className="mt-4 p-4 border border-amber-500/20 bg-amber-950/20 rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                  <input 
                                    className="bg-transparent text-sm font-semibold text-amber-400 focus:outline-none flex-1"
                                    value={topic.assignment.title}
                                    onChange={(e) => { const newM = [...modules]; newM[mIndex].topics[tIndex].assignment.title = e.target.value; setModules(newM); }}
                                    placeholder="Assignment Title"
                                  />
                                  <button onClick={() => { const newM = [...modules]; delete newM[mIndex].topics[tIndex].assignment; setModules(newM); }} className="text-[10px] text-red-400 font-bold uppercase">Remove</button>
                                </div>
                                <textarea
                                  value={topic.assignment.description}
                                  onChange={(e) => { const newM = [...modules]; newM[mIndex].topics[tIndex].assignment.description = e.target.value; setModules(newM); }}
                                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                                />
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
                        className="text-sm font-medium text-emerald-400 mt-4"
                      >
                        + Add Topic
                      </button>
                    </div>
                  </div>
                ))}
              </StaggerWrapper>
            )}
            <div className="pt-6 relative z-10">
              <button onClick={() => setActiveTab("settings")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Continue
              </button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl text-left">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
              >
                 <option value="draft">Draft (Private)</option>
                 <option value="published">Published (Public)</option>
              </select>
            </div>
            <div className="pt-4 mt-8">
              <button 
                onClick={handleUpdateCourse}
                disabled={saving}
                className="flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </StaggerWrapper>
    </div>
  );
}
