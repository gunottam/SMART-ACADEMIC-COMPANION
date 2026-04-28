import { getGroqApiKey } from "@/lib/config";

export type LearningInsights = {
  weakAreas: Array<{ topic: string; reason: string }>;
  planTitle: string;
  planSummary: string;
  weeklySteps: Array<{ day: string; focus: string; minutes: number }>;
};

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM = `You are an expert learning scientist and tutor. Given a JSON snapshot of a learner's performance (quiz scores by topic, completion counts, and optional legacy weak topic labels), produce actionable insights.

Respond with ONLY valid JSON (no markdown fences) matching this shape:
{
  "weakAreas": [ { "topic": string, "reason": string } ],
  "planTitle": string,
  "planSummary": string,
  "weeklySteps": [ { "day": string, "focus": string, "minutes": number } ]
}

Rules:
- weakAreas: 2–5 items; topics must be concise titles inferred from the data (reuse snapshot wording when possible).
- planTitle: short motivating headline.
- planSummary: 2–4 sentences; concrete and realistic for a part-time learner.
- weeklySteps: exactly 5 rows (Mon–Fri); minutes between 15–45; focus strings start with a verb.`;

function extractJsonObject(raw: string): string | null {
  const t = raw.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const inner = fence?.[1]?.trim() ?? t;
  const start = inner.indexOf("{");
  const end = inner.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  return inner.slice(start, end + 1);
}

function normalizeInsights(parsed: unknown): LearningInsights | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  const weakRaw = o.weakAreas;
  const weakAreas = Array.isArray(weakRaw)
    ? weakRaw
        .map((w) => {
          if (!w || typeof w !== "object") return null;
          const x = w as Record<string, unknown>;
          const topic = typeof x.topic === "string" ? x.topic : "";
          const reason = typeof x.reason === "string" ? x.reason : "";
          if (!topic) return null;
          return { topic, reason: reason || "Needs reinforcement based on recent attempts." };
        })
        .filter(Boolean)
    : [];
  const planTitle = typeof o.planTitle === "string" ? o.planTitle : "Your personalized study plan";
  const planSummary =
    typeof o.planSummary === "string"
      ? o.planSummary
      : "Focus on the weakest topics first with short daily sessions.";
  const stepsRaw = o.weeklySteps;
  const weeklySteps = Array.isArray(stepsRaw)
    ? stepsRaw.slice(0, 7).map((s) => {
        if (!s || typeof s !== "object") {
          return { day: "—", focus: "Review weakest topics", minutes: 25 };
        }
        const x = s as Record<string, unknown>;
        return {
          day: typeof x.day === "string" ? x.day : "—",
          focus: typeof x.focus === "string" ? x.focus : "Practice",
          minutes: typeof x.minutes === "number" && x.minutes > 0 ? Math.min(90, x.minutes) : 25,
        };
      })
    : [];

  if (!weakAreas.length) return null;

  return {
    weakAreas: weakAreas as LearningInsights["weakAreas"],
    planTitle,
    planSummary,
    weeklySteps:
      weeklySteps.length >= 5
        ? weeklySteps.slice(0, 5)
        : [
            ...weeklySteps,
            ...Array.from({ length: Math.max(0, 5 - weeklySteps.length) }, (_, i) => ({
              day: ["Mon", "Tue", "Wed", "Thu", "Fri"][weeklySteps.length + i] ?? "Day",
              focus: "Spaced repetition on weak topics",
              minutes: 25,
            })),
          ].slice(0, 5),
  };
}

export async function generateLearningInsightsWithGroq(
  performanceSnapshotJson: string
): Promise<LearningInsights | null> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;

  const res = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.35,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Performance snapshot (JSON):\n${performanceSnapshotJson}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[groq]", res.status, errText);
    return null;
  }

  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = body.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") return null;

  const jsonStr = extractJsonObject(raw);
  if (!jsonStr) return null;

  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    return normalizeInsights(parsed);
  } catch {
    return null;
  }
}
