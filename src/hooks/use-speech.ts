import { useEffect, useState, useCallback, useRef } from "react";
import type { Language } from "@/lib/agronova-demo";

const LANG_VOICE_MAP: Record<Language, string[]> = {
  en: ["en-US", "en-GB", "en-CA", "en-AU", "en"],
  bn: ["bn-BD", "bn-IN", "bn"],
  hi: ["hi-IN", "hi"],
  es: ["es-ES", "es-MX", "es-US", "es"],
  sw: ["sw-KE", "sw-TZ", "sw"],
};

// Female voice name identifiers across Chrome, Edge, Safari, iOS, and Android
const FEMALE_VOICE_NAMES = [
  "female", "girl", "woman",
  "zira", "jenny", "aria", "samantha", "victoria", "karen", "tessa", "moira",
  "sonia", "heera", "tanvi", "swara", "shreya", "ananya",
  "elena", "monica", "paulina", "sabina", "tashi", "salma",
  "google us english", "google uk english female",
];

export function useSpeech(lang: Language = "en") {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);

    const updateVoices = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window && typeof window.speechSynthesis.getVoices === "function") {
        try {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) {
            voicesRef.current = v;
          }
        } catch {
          // Ignore voice fetch error in strict sandbox
        }
      }
    };

    updateVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || typeof window === "undefined" || !("speechSynthesis" in window)) return;

      try {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
      } catch {
        // Ignore cancel errors
      }

      // Clean markdown tags, asterisks, hashtags for smooth pronunciation
      const cleanText = text.replace(/[*#_`]/g, "").trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Nova Voice Persona: Clear, lively 18 to 20 year old girl voice
      // Pitch: 1.22 gives a bright, youthful, articulate female tone without sounding squeaky
      // Rate: 1.02 delivers clean, natural, engaging pacing
      utterance.pitch = 1.22;
      utterance.rate = 1.02;

      const availableVoices =
        voicesRef.current.length > 0
          ? voicesRef.current
          : typeof window !== "undefined" && "speechSynthesis" in window && typeof window.speechSynthesis.getVoices === "function"
            ? window.speechSynthesis.getVoices()
            : [];

      const preferredCodes = LANG_VOICE_MAP[lang] || ["en-US"];

      // 1. Filter voices for the current language
      const langVoices = availableVoices.filter((v) =>
        preferredCodes.some((code) => v.lang.toLowerCase().startsWith(code.toLowerCase())),
      );

      // 2. Prioritize clear female voice matching the language
      const femaleLangVoice = langVoices.find((v) => {
        const nameLower = v.name.toLowerCase();
        return FEMALE_VOICE_NAMES.some((fn) => nameLower.includes(fn));
      });

      // 3. Fallback to any language voice, or a global clear female voice
      const bestVoice =
        femaleLangVoice ||
        langVoices[0] ||
        availableVoices.find((v) => {
          const nameLower = v.name.toLowerCase();
          return FEMALE_VOICE_NAMES.some((fn) => nameLower.includes(fn));
        });

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      } else {
        utterance.lang = preferredCodes[0] || "en-US";
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [lang, supported],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, stop, speaking, supported };
}

