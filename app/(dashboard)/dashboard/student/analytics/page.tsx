"use client";

import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Activity,
  Target,
  Brain,
  Clock,
  Loader2,
  Sparkles,
  RefreshCw,
  ListChecks,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getStudentAnalytics,
  getStudentLearningInsights,
  type StudentLearningInsightsResult,
} from "@/actions/student";
import { StaggerWrapper } from "@/components/ui/StaggerWrapper";
import { Button } from "@/components/ui/Button";

type AttemptPoint = { score: number; timestamp: string | Date };
type StudentStats = {
  totalCoursesEnrolled: number;
  topicsCompleted: number;
  averageScore: number;
  weakAreas: string[];
  recentAssessments: AttemptPoint[];
  source?: string;
};

const BRAND = "#2563eb";

export default function AnalyticsPage() {
  const [data, setData] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insights, setInsights] = useState<StudentLearningInsightsResult | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const analyticsRes = await getStudentAnalytics();
      if (!cancelled && analyticsRes.success && analyticsRes.stats) {
        setData(analyticsRes.stats as StudentStats);
      }
      if (!cancelled) setLoading(false);

      setInsightsLoading(true);
      setInsightsError(null);
      const insightsRes = await getStudentLearningInsights();
      if (cancelled) return;
      setInsights(insightsRes);
      setInsightsLoading(false);
      if (!insightsRes.success) setInsightsError(insightsRes.error);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    const res = await getStudentLearningInsights();
    setInsights(res);
    setInsightsLoading(false);
    if (!res.success) setInsightsError(res.error);
  }, []);

  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    );
  }

  const rawAttempts = data?.recentAssessments || [];
  const sortedAttempts = [...rawAttempts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const chartData =
    sortedAttempts.length > 0
      ? sortedAttempts.map((a, i) => ({
          name: `#${i + 1}`,
          score: a.score,
        }))
      : [{ name: "—", score: 0 }];

  const legacyWeak = data?.weakAreas || [];
  const aiWeak =
    insights?.success && insights.insights ? insights.insights.weakAreas : [];

  const sourceLabel =
    insights?.success === true
      ? insights.source === "groq"
        ? "Groq AI"
        : insights.source === "mock"
          ? "Demo data"
          : "Smart fallback"
      : null;

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-600 tracking-tight mb-2">
          Analytics
        </h1>
        <p className="text-sm text-slate-600">
          Mastery signals, AI-detected weak areas, and a tailored weekly plan.
        </p>
      </div>

      <StaggerWrapper className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Average"
          value={`${data?.averageScore || 0}%`}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          title="Topics Completed"
          value={data?.topicsCompleted || 0}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title="Attempts"
          value={rawAttempts.length}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          title="Active Courses"
          value={data?.totalCoursesEnrolled || 0}
          icon={<Brain className="w-5 h-5" />}
        />
      </StaggerWrapper>

      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                AI learning plan
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Weak areas and schedule are generated from your attempts (Groq when{" "}
                <code className="text-xs bg-slate-100 px-1 rounded">GROQ_API_KEY</code>{" "}
                is set; otherwise a deterministic fallback).
              </p>
              {sourceLabel && (
                <p className="text-xs text-slate-500 mt-2">
                  Source: <span className="font-medium text-slate-700">{sourceLabel}</span>
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 inline-flex items-center gap-2"
            onClick={() => loadInsights()}
            disabled={insightsLoading}
          >
            {insightsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Regenerate
          </Button>
        </div>

        {insightsLoading && !insights?.success ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            Building your plan…
          </div>
        ) : insightsError ? (
          <p className="text-sm text-red-600 py-4">{insightsError}</p>
        ) : insights?.success ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#2563EB]" />
                Detected weak areas
              </h3>
              <ul className="space-y-3">
                {aiWeak.length === 0 ? (
                  <li className="text-sm text-slate-500 py-4 text-center rounded-xl border border-dashed border-slate-200 bg-white/60">
                    No weak areas listed — try again after more quiz attempts.
                  </li>
                ) : (
                  aiWeak.map((w, i) => (
                    <li
                      key={`${w.topic}-${i}`}
                      className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-slate-900">{w.topic}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{w.reason}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {insights.insights.planTitle}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {insights.insights.planSummary}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[#2563EB]" />
                  Suggested week
                </h4>
                <ol className="space-y-2">
                  {insights.insights.weeklySteps.map((step, i) => (
                    <li
                      key={`${step.day}-${i}`}
                      className="flex gap-3 text-sm border border-slate-200/90 rounded-lg px-3 py-2.5 bg-white/80"
                    >
                      <span className="font-semibold text-[#2563EB] w-10 shrink-0">
                        {step.day}
                      </span>
                      <span className="text-slate-700 flex-1">{step.focus}</span>
                      <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                        {step.minutes}m
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/70 p-6 h-[360px] flex flex-col shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Score trajectory
          </h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: BRAND }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={BRAND}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#fafcff] to-[#eef4ff]/70 p-6 flex flex-col shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Progress flags
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Topics marked weak from quizzes (&lt;70%) before AI enrichment.
          </p>
          <div className="space-y-2 flex-1">
            {legacyWeak.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                No legacy weak flags on record.
              </p>
            ) : (
              legacyWeak.map((topic, i) => (
                <div
                  key={`${topic}-${i}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <span className="text-sm text-slate-700 leading-snug pr-4 line-clamp-2">
                    {topic}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-red-600 shrink-0">
                    Review
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
