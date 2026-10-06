/**
 * Google Gemini AI Integration for AgroNova
 * Uses the free Google Gemini 1.5 Flash API for agricultural advice,
 * leaf diagnosis (vision), and personalized crop rotation advisory.
 */

import { type Language } from "./agronova-demo";

export interface GeminiResponse {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Retrieves the Gemini API key from localStorage, import.meta.env, or process.env
 */
export function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("agronova_gemini_api_key");
    if (local && local.trim()) return local.trim();
  }

  const envKey =
    (typeof import.meta !== "undefined" &&
      ((import.meta.env as Record<string, string | undefined>)["VITE_GEMINI_API_KEY"] ||
        (import.meta.env as Record<string, string | undefined>)["GEMINI_API_KEY"] ||
        (import.meta.env as Record<string, string | undefined>)["VITE_AI_API_KEY"])) ||
    (typeof process !== "undefined" &&
      (process.env["VITE_GEMINI_API_KEY"] || process.env["GEMINI_API_KEY"]));

  return typeof envKey === "string" ? envKey.trim() : "";
}

/**
 * Saves Gemini API Key to localStorage
 */
export function setGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (!key.trim()) {
      localStorage.removeItem("agronova_gemini_api_key");
    } else {
      localStorage.setItem("agronova_gemini_api_key", key.trim());
    }
  }
}

/**
 * Tests connection to Google Gemini API
 */
export async function testGeminiApiKey(
  keyToTest?: string,
): Promise<{ ok: boolean; message: string }> {
  const key = keyToTest || getGeminiApiKey();
  if (!key) {
    return { ok: false, message: "No Gemini API key found. Enter a key from Google AI Studio." };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Say 'Gemini connected successfully for AgroNova!'" }] }],
        generationConfig: { maxOutputTokens: 25 },
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      return { ok: false, message: `Gemini API error: ${msg}` };
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return { ok: true, message: reply || "Connected successfully!" };
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Network error: ${errMessage}` };
  }
}

/**
 * Generate text content with Gemini 1.5 Flash
 */
export async function generateGeminiText(
  prompt: string,
  systemInstruction?: string,
  temperature = 0.6,
): Promise<GeminiResponse> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      text: "",
      error: "No Gemini API key configured. Add VITE_GEMINI_API_KEY to your .env file.",
    };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const contents: Array<{ parts: Array<{ text: string }> }> = [];

    let combinedPrompt = prompt;
    if (systemInstruction) {
      combinedPrompt = `[SYSTEM INSTRUCTION]\n${systemInstruction}\n\n[USER REQUEST]\n${prompt}`;
    }

    contents.push({
      parts: [{ text: combinedPrompt }],
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: 900,
        },
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        text: "",
        error: errJson?.error?.message || `HTTP ${res.status}: Failed to reach Gemini API`,
      };
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply && typeof reply === "string") {
      return { success: true, text: reply.trim() };
    }

    return { success: false, text: "", error: "No response candidate generated." };
  } catch (err: unknown) {
    return {
      success: false,
      text: "",
      error: err instanceof Error ? err.message : "Failed to query Gemini API",
    };
  }
}

/**
 * Diagnose crop disease using Gemini 1.5 Flash Vision (image + text)
 */
export async function diagnoseCropImage(
  base64Data: string,
  mimeType: string,
  cropName: string,
  symptoms: string,
  lang: Language = "en",
): Promise<GeminiResponse> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      text: "",
      error: "No Gemini API key found. Add VITE_GEMINI_API_KEY to your .env file.",
    };
  }

  const prompt = `You are a certified agronomy plant pathologist specializing in South Asian and global agriculture.
Analyze this leaf/crop image for crop: "${cropName || "Unknown Crop"}".
Farmer notes / symptoms observed: "${symptoms || "None provided"}".

Please respond in language: "${lang}".
Provide a structured assessment:
1. 🔍 **Probable Disease/Issue**: (Name and whether it's Fungal, Bacterial, Viral, Pest, or Nutrient deficiency)
2. ⚠️ **Confidence & Severity**: (High, Medium, or Low)
3. 🩺 **Immediate Action / Treatment**: (Organic & low-cost remedies first, then safe chemical options)
4. 🛡️ **Prevention**: (How to prevent recurrence in this field rotation)
5. 🌾 **Field Warning**: (Advise if neighboring crops or next season crops are at risk)

Keep your response practical, concise, and helpful for a smallholder farmer.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 900,
        },
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        text: "",
        error: errJson?.error?.message || `HTTP ${res.status}: Failed to analyze image with Gemini`,
      };
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply && typeof reply === "string") {
      return { success: true, text: reply.trim() };
    }

    return { success: false, text: "", error: "No diagnosis received from Gemini." };
  } catch (err: unknown) {
    return {
      success: false,
      text: "",
      error: err instanceof Error ? err.message : "Image diagnosis network request failed",
    };
  }
}
