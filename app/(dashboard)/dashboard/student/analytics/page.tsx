"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Activity, Target, Brain, Clock, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudentAnalytics } from "@/actions/student";
import { StaggerWrapper } from "@/components/ui/StaggerWrapper";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getStudentAnalytics();
      if (res.success) {
        setData(res.stats);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>;
  }

  // Construct chart data strictly from Db attempt log timestamps
  const rawAttempts = data?.recentAssessments || [];
  const sortedAttempts = [...rawAttempts].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  const chartData = sortedAttempts.length > 0 ? sortedAttempts.map((a: any, index: number) => ({
    name: `Quiz ${index + 1}`,
    score: a.score
  })) : [
    { name: 'Start', score: 0 }
  ];

  const weakAreas = data?.weakAreas || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50 tracking-tight mb-2">
          Performance Analytics
        </h1>
        <p className="text-sm text-neutral-400">
          In-depth metrics on your learning patterns and mastery levels.
        </p>
      </div>

      <StaggerWrapper className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Average" value={`${data?.averageScore || 0}%`} icon={<Activity className="w-5 h-5" />} />
        <StatCard title="Topics Completed" value={data?.topicsCompleted || 0} icon={<Clock className="w-5 h-5" />} />
        <StatCard title="Assessments Taken" value={rawAttempts.length} icon={<Target className="w-5 h-5" />} />
        <StatCard title="Courses Active" value={data?.totalCoursesEnrolled || 0} icon={<Brain className="w-5 h-5" />} />
      </StaggerWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-medium text-neutral-50 mb-6">Learning Trajectory (Last 7 Days)</h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 flex flex-col">
          <h3 className="text-lg font-medium text-neutral-50 mb-6">Weak Areas Identified</h3>
          <div className="space-y-4 flex-1">
            {weakAreas.length === 0 ? (
               <p className="text-sm text-neutral-500 text-center py-4">No critical weaknesses detected yet!</p>
            ) : (
              weakAreas.map((topic: string, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                  <span className="text-sm font-medium text-neutral-300 leading-snug pr-4">{topic}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-red-400 shrink-0">Review</span>
                </div>
              ))
            )}
          </div>
          <button className="mt-4 w-full py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-sm text-neutral-300 transition-colors">
            Generate Study Plan
          </button>
        </div>
      </div>
    </div>
  );
}
