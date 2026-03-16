"use client";

import { useCallback, useRef } from "react";

/**
 * useAuraVoice - A hook to provide Dr. Aura with a professional medical voice.
 * Uses the Web Speech API's SpeechSynthesis keys.
 */
export function useAuraVoice() {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!synth) return;

    // Cancel any ongoing speech
    synth.cancel();

    // Clean text (remove markdown symbols)
    const cleanText = text
      .replace(/[#*`_]/g, "")
      .replace(/\[.*?\]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to find a premium medical-sounding voice (e.g., Siri, Samantha, Google UK)
    const voices = synth.getVoices();
    const auraVoice = voices.find(v => 
      v.name.includes("Samantha") || 
      v.name.includes("Google UK English Female") || 
      v.name.includes("Siri")
    ) || voices[0];

    if (auraVoice) {
      utterance.voice = auraVoice;
    }

    utterance.pitch = 1.05; // Slightly professional and sharp
    utterance.rate = 1.1;   // Professional clinical speed
    utterance.volume = 0.9;

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [synth]);

  const stop = useCallback(() => {
    if (synth) {
      synth.cancel();
    }
  }, [synth]);

  return { speak, stop, isSpeaking: synth?.speaking || false };
}
