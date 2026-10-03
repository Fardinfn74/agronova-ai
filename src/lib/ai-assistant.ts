import { novaReply, type Language, type Scenario, type DemoField } from "@/lib/agronova-demo";
import type { PowerReading } from "@/lib/nasa-power";
import { generateGeminiText, getGeminiApiKey } from "@/lib/gemini";

export type AiContext = {
  field: DemoField;
  scenario: Scenario;
  nasaReadings?: PowerReading[] | undefined;
  lang: Language;
};

/**
 * Intelligent AgroNova assistant:
 * Attempts to query Google Gemini 1.5 Flash (free tier),
 * otherwise provides instant grounded responses via deterministic agronomic engine.
 */
export async function askNovaAssistant(
  question: string,
  context: AiContext,
): Promise<string> {
  const { field, scenario, nasaReadings, lang } = context;

  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const recentTemp = nasaReadings?.slice(-1)[0]?.temperature ?? 30;
      const recentRain = nasaReadings?.slice(-7).reduce((acc, r) => acc + (r.rain ?? 0), 0) ?? 15;
      const recentRh = nasaReadings?.slice(-1)[0]?.humidity ?? 65;

      const systemPrompt = `You are Nova, an expert AI agricultural decision-support companion for smallholder farmers built for the NASA Space Apps Challenge 2026.
Field context:
- Field: ${field.name} (${field.district})
- Current crop: ${field.crop}, Season: ${field.season}
- Soil: ${field.soil}, Water access: ${field.water}
- Selected Rotation: ${scenario.name} (Sequence: ${scenario.sequence.join(" -> ")})
- Projected Metrics: Water Fit: ${scenario.water}/100, Soil Index: ${scenario.soil}/100, Climate Resilience: ${scenario.resilience}/100
- NASA POWER Earth Observation Data: 7-day cumulative rainfall ${recentRain.toFixed(1)}mm, current temperature ${recentTemp}°C, relative humidity ${recentRh}%.

Instructions:
- Respond in language: "${lang}".
- Tone: Supportive, scientifically grounded in agronomy, practical for smallholder farmers.
- Emphasize actionable steps regarding crop rotation, soil moisture, and weather preparedness.
- Keep the response concise (2-4 paragraphs maximum). Do not make unrealistic yield guarantees.`;

      const result = await generateGeminiText(question, systemPrompt, 0.6);

      if (result.success && result.text) {
        return result.text;
      }
    } catch {
      // Fallback silently to deterministic agronomy engine
    }
  }

  // Instant grounded fallback
  return novaReply(question, lang, scenario);
}

