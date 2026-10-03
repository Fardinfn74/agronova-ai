import { useEffect, useState, useCallback } from "react";
import type { Language } from "@/lib/agronova-demo";

const LANG_VOICE_MAP: Record<Language, string[]> = {
  en: ["en-US", "en-GB", "en"],
  bn: ["bn-BD", "bn-IN", "bn"],
  hi: ["hi-IN", "hi"],
  es: ["es-ES", "es-MX", "es"],
  sw: ["sw-KE", "sw-TZ", "sw"],
};

export function useSpeech(lang: Language = "en") {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || typeof window === "undefined") return;

      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Attempt to pick an appropriate language voice
      const voices = window.speechSynthesis.getVoices();
      const preferredCodes = LANG_VOICE_MAP[lang] || ["en-US"];
      const matchedVoice = voices.find((v) =>
        preferredCodes.some((code) => v.lang.toLowerCase().startsWith(code.toLowerCase())),
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.lang = matchedVoice?.lang || preferredCodes[0] || "en-US";

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
