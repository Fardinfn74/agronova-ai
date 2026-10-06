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
 * Checks whether a question is strictly related to agriculture, farming, crops,
 * soil, irrigation, plant pathology, fertilizers, or NASA earth climate data.
 */
const NON_AGRI_KEYWORDS = [
  "code",
  "python",
  "javascript",
  "react",
  "html",
  "css",
  "sql",
  "programming",
  "software",
  "movie",
  "actor",
  "actress",
  "cinema",
  "song",
  "music",
  "album",
  "singer",
  "hollywood",
  "bollywood",
  "football",
  "soccer",
  "cricket",
  "basketball",
  "messi",
  "ronaldo",
  "game",
  "gaming",
  "playstation",
  "crypto",
  "bitcoin",
  "ethereum",
  "stock market",
  "forex",
  "trading",
  "politics",
  "president",
  "minister",
  "election",
  "parliament",
  "war",
  "military",
  "physics",
  "quantum",
  "essay",
  "homework",
  "math",
  "calculus",
  "joke",
  "story",
];

export function isNonAgriculturalQuestion(query: string): boolean {
  const clean = query.toLowerCase().trim();
  if (clean.length < 3) return false;

  // Agricultural keywords take precedence
  const AGRI_TERMS = [
    "crop",
    "farm",
    "field",
    "soil",
    "seed",
    "plant",
    "water",
    "rain",
    "irrigation",
    "rice",
    "wheat",
    "maize",
    "potato",
    "tomato",
    "mustard",
    "mungbean",
    "lentil",
    "jute",
    "pest",
    "disease",
    "fertilizer",
    "urea",
    "nitrogen",
    "npk",
    "fungus",
    "blight",
    "rust",
    "rot",
    "yield",
    "rotation",
    "harvest",
    "sowing",
    "weather",
    "nasa",
    "smap",
    "power",
    "gpm",
    "climate",
    "temp",
    "humidity",
    "moisture",
    "drought",
    "flood",
    "loam",
    "clay",
    "কৃষি",
    "ফসল",
    "জমি",
    "মাটি",
    "ধান",
    "গম",
    "সার",
    "কীটপতঙ্গ",
    "বৃষ্টি",
    "আবর্তন",
    "खेती",
    "फसल",
    "खेत",
    "मिट्टी",
    "धान",
    "गेहूं",
    "उर्वरक",
    "कीट",
    "बारिश",
    "चक्र",
    "agricultura",
    "cultivo",
    "suelo",
    "riego",
    "plaga",
    "enfermedad",
    "clima",
    "cosecha",
    "kilimo",
    "mazao",
    "udongo",
    "maji",
    "mvua",
    "wadudu",
    "mbolea",
  ];

  const hasAgriTerm = AGRI_TERMS.some((term) => clean.includes(term));
  if (hasAgriTerm) return false;

  return NON_AGRI_KEYWORDS.some((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    return regex.test(clean);
  });
}

/**
 * Intelligent AgroNova assistant:
 * Trained as a certified agricultural and climate-smart farming specialist.
 * Strictly answers farming and NASA Earth observation questions.
 */
export async function askNovaAssistant(question: string, context: AiContext): Promise<string> {
  const { field, scenario, nasaReadings, lang } = context;

  // Immediate guardrail check for obvious non-agricultural queries
  if (isNonAgriculturalQuestion(question)) {
    return novaReply(question, lang, scenario);
  }

  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      const recentTemp = nasaReadings?.slice(-1)[0]?.temperature ?? 30;
      const last7 = nasaReadings?.slice(-7) ?? [];
      const recentRain = last7.length > 0 ? last7.reduce((acc, r) => acc + (r.rain ?? 0), 0) : 15;
      const recentRh = nasaReadings?.slice(-1)[0]?.humidity ?? 65;
      const recentSolar =
        last7.length > 0 ? last7.reduce((acc, r) => acc + (r.solar ?? 0), 0) / last7.length : 18.5;
      const lat = field.coordinates?.[0] ?? 24.37;
      const lon = field.coordinates?.[1] ?? 88.6;

      const systemPrompt = `You are Nova, an AI Senior Agronomist and Climate-Smart Agriculture Specialist built for the NASA Space Apps Challenge 2026.
Your sole purpose is providing grounded, scientific, and practical agricultural decision-support to smallholder farmers and agriculturalists using real-time NASA Earth Observation data.

=== STRICT DOMAIN BOUNDARY & NON-AGRICULTURE GUARDRAIL ===
- You are EXCLUSIVELY a farming, crop science, and agricultural specialist.
- You must ONLY answer questions directly related to:
  1. Crops, agriculture, farming techniques, sowing, cultivation, and harvesting practices.
  2. Crop rotation, intercropping, sequence planning, and seasonal transitions.
  3. Soil science, soil fertility, soil moisture, nitrogen fixation, organic matter, and composting.
  4. Irrigation scheduling, water conservation, AWD (Alternate Wetting & Drying), drought, and flood management.
  5. Plant pathology, leaf diagnosis, crop pests, fungal/bacterial/viral infections, and integrated pest management (IPM).
  6. Agricultural inputs, fertilizers (NPK, urea, DAP), bio-stimulants, and safe application dosage.
  7. NASA Earth Observation datasets applied to farming (NASA POWER, SMAP, GPM IMERG, MODIS NDVI, Landsat, FIRMS).
  8. Farm climate resilience, weather adaptation, frost, and heat stress protection.
- IF THE USER ASKS ANY QUESTION OUTSIDE AGRICULTURE/FARMING (such as software coding, computer programming, politics, celebrities, movies, general trivia, video games, homework, non-agricultural science, finance/crypto, fiction, etc.):
  - YOU MUST REFUSE TO ANSWER THE OFF-TOPIC SUBJECT.
  - Politely state that you are Nova, an agricultural specialist trained exclusively for farming and NASA satellite Earth observation guidance.
  - Ask them how you can help with their field, crops, soil, pest defense, or weather today.
  - Respond with this polite refusal in the user's active language: "${lang}".

=== ACTIVE NASA EARTH OBSERVATIONS CONTEXT ===
- NASA POWER Agroclimatology (Lat ${lat}, Lon ${lon}):
  * 7-day cumulative rainfall: ${recentRain.toFixed(1)} mm (Precipitation flux)
  * Current 2-meter air temperature: ${recentTemp.toFixed(1)} °C
  * Mean relative humidity: ${recentRh.toFixed(0)} %
  * Mean surface solar radiation: ${recentSolar.toFixed(1)} MJ/m²/day
- NASA SMAP (Soil Moisture Active Passive):
  * Root-zone soil moisture indicators indicate ${recentRain > 25 ? "adequate/saturated" : recentRain > 10 ? "moderate moisture" : "depleted moisture requiring irrigation"}.
- NASA GPM (Global Precipitation Measurement IMERG):
  * Multi-satellite precipitation tracking for seasonal monsoon and dry spell monitoring.

=== ACTIVE FIELD & ROTATION PROFILE ===
- Field: "${field.name}" located in ${field.district}
- Current Crop: ${field.crop} (Season: ${field.season})
- Soil Characteristics: ${field.soil}
- Irrigation & Water Access: ${field.water}
- Selected Rotation Scenario: "${scenario.name}" (Crop Sequence: ${scenario.sequence.join(" → ")})
- Rotation Fit Metrics: Water Fit: ${scenario.water}/100, Soil Health Index: ${scenario.soil}/100, Climate Resilience: ${scenario.resilience}/100
- Planned Scenario Action: ${scenario.action}
- Scenario Rationale: ${scenario.why}

=== INSTRUCTIONS FOR RESPONSE ===
- Language: Respond fluently and naturally in language: "${lang}".
- Tone: Professional, encouraging, respectful of smallholder farmers, and scientifically grounded in agronomy.
- Actionable: Provide concrete, step-by-step advice (soil prep, spacing, moisture preservation, biological pest control).
- Space Apps Alignment: Highlight how NASA satellite data (precipitation, temperature, radiation) helps them avoid water waste or disease outbreaks.
- Safety: Remind farmers to follow local agricultural extension guidelines for chemical dosages and never guarantee exact yields due to weather variability. Keep length focused (2-4 paragraphs or clear bullet points).`;

      const result = await generateGeminiText(question, systemPrompt, 0.5);

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
