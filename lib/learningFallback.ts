import type { LearningInsights } from "@/lib/groq";
import type { StudentPerformanceSnapshot } from "@/lib/studentPerformance";

/** Deterministic plan when Groq is unavailable or returns nothing. */
export function buildFallbackLearningInsights(
  snapshot: StudentPerformanceSnapshot
): LearningInsights {
  const topicHits = new Map<string, { below: number; sum: number; n: number }>();
  for (const a of snapshot.attempts) {
    const label = a.topicTitle || "General assessment practice";
    const row = topicHits.get(label) ?? { below: 0, sum: 0, n: 0 };
    row.n += 1;
    row.sum += a.score;
    if (a.score < 70) row.below += 1;
    topicHits.set(label, row);
  }

  const ranked = [...topicHits.entries()]
    .map(([topic, v]) => ({
      topic,
      score: v.n ? v.sum / v.n : 0,
      below: v.below,
    }))
    .sort((a, b) => a.score - b.score || b.below - a.below);

  let weakAreas = ranked.slice(0, 4).map((r) => ({
    topic: r.topic,
    reason:
      r.below > 0
        ? `Recent attempts below 70% (${r.below} low score${r.below > 1 ? "s" : ""}).`
        : `Average score ${Math.round(r.score)}% — reinforce with targeted practice.`,
  }));

  for (const t of snapshot.legacyWeakTopicTitles) {
    if (weakAreas.some((w) => w.topic === t)) continue;
    if (weakAreas.length >= 5) break;
    weakAreas.push({
      topic: t,
      reason: "Flagged in your course progress as needing review.",
    });
  }

  if (weakAreas.length === 0) {
    weakAreas = [
      {
        topic: "Study rhythm",
        reason: "Build a steady cadence—short daily sessions beat rare cramming.",
      },
    ];
  }

  const avg = snapshot.averageScore;
  const planTitle =
    avg >= 80
      ? "Maintenance & stretch goals"
      : avg >= 65
        ? "Strengthen weak topics over two weeks"
        : "Reset fundamentals with a tight weekly rhythm";

  const planSummary = `You have ${snapshot.totalAttempts} recorded attempt${snapshot.totalAttempts !== 1 ? "s" : ""} across ${snapshot.coursesEnrolled} course${snapshot.coursesEnrolled !== 1 ? "s" : ""}. Focus on the listed weak areas first; spend most minutes on the lowest scores, then integrate mixed review so skills stick.`;

  const weeklySteps = [
    {
      day: "Mon",
      focus: `Diagnose: redo missed items on ${weakAreas[0]?.topic ?? "core topics"} (untimed)`,
      minutes: 25,
    },
    {
      day: "Tue",
      focus: "Mixed mini-quiz: blend last 3 weak topics at moderate difficulty",
      minutes: 30,
    },
    {
      day: "Wed",
      focus: "Apply: one small project task that uses the weakest skill end-to-end",
      minutes: 35,
    },
    {
      day: "Thu",
      focus: "Speed round: timed drills on lowest two averages only",
      minutes: 25,
    },
    {
      day: "Fri",
      focus: "Review mistakes notebook; plan next week’s single priority topic",
      minutes: 20,
    },
  ];

  return {
    weakAreas,
    planTitle,
    planSummary,
    weeklySteps,
  };
}
