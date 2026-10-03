import { novaReply, type Language, type Scenario, type DemoField } from "@/lib/agronova-demo";
import type { PowerReading } from "@/lib/nasa-power";

export type AiContext = {
  field: DemoField;
  scenario: Scenario;
  nasaReadings?: PowerReading[] | undefined;
  lang: Language;
};

/**
 * Intelligent AgroNova assistant:
 * Attempts to query an LLM provider if configured in environment,
 * otherwise provides instant grounded responses via deterministic agronomic engine.
 */
export async function askNovaAssistant(
  question: string,
  context: AiContext,
): Promise<string> {
  const { field, scenario, nasaReadings, lang } = context;

  // Check for client or server configured LLM key
  const apiKey =
    (typeof import.meta !== "undefined" && import.meta.env?.['VITE_AI_API_KEY']) ||
    (typeof process !== "undefined" && process.env?.['AI_API_KEY']);

  if (apiKey && typeof fetch !== "undefined") {
    try {
      const recentTemp = nasaReadings?.slice(-1)[0]?.temperature ?? 30;
      const recentRain = nasaReadings?.slice(-7).reduce((acc, r) => acc + (r.rain ?? 0), 0) ?? 15;

      const systemPrompt = `You are Nova, an AI agricultural decision-support companion for smallholder farmers built for the NASA Space Apps Challenge 2026.
Field context:
- Name: ${field.name} (${field.district})
- Current crop: ${field.crop}, Season: ${field.season}
- Soil: ${field.soil}, Water access: ${field.water}
- Selected Rotation: ${scenario.name} (${scenario.sequence.join(" -> ")})
- NASA POWER Recent Climate: 7-day rain ${recentRain}mm, latest temp ${recentTemp}°C.
Instructions:
Respond concisely in plain, accessible words suited for a farmer in language: "${lang}". Keep advice practical, supportive, and grounded in the data. Never guarantee exact yields.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          max_tokens: 250,
          temperature: 0.6,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const reply = json.choices?.[0]?.message?.content;
        if (reply && typeof reply === "string") {
          return reply.trim();
        }
      }
    } catch {
      // Fallback silently to deterministic agronomy engine
    }
  }

  // Instant grounded fallback
  return novaReply(question, lang, scenario);
}
