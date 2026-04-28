/** Demo mode: uses curated mock payloads so dashboards show full UI without seed data. */
export function isMockDataMode(): boolean {
  return process.env.USE_MOCK_DATA === "true" || process.env.USE_MOCK_DATA === "1";
}

export function getGroqApiKey(): string | undefined {
  const k = process.env.GROQ_API_KEY;
  return k?.trim() || undefined;
}
