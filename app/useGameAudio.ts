"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type GameSound =
  | "tap"
  | "navigate"
  | "good"
  | "error"
  | "hint"
  | "reset"
  | "success"
  | "complete";

type Tone = {
  frequency: number;
  endFrequency?: number;
  delay?: number;
  duration: number;
  volume: number;
  type: OscillatorType;
};

const SOUND_STORAGE_KEY = "break-the-app:sound:v1";

const PATTERNS: Record<GameSound, Tone[]> = {
  tap: [
    { frequency: 520, endFrequency: 390, duration: 0.055, volume: 0.025, type: "square" },
  ],
  navigate: [
    { frequency: 290, endFrequency: 360, duration: 0.075, volume: 0.028, type: "triangle" },
    { frequency: 475, delay: 0.055, duration: 0.06, volume: 0.022, type: "sine" },
  ],
  good: [
    { frequency: 430, endFrequency: 560, duration: 0.09, volume: 0.032, type: "triangle" },
    { frequency: 720, delay: 0.065, duration: 0.1, volume: 0.026, type: "sine" },
  ],
  error: [
    { frequency: 150, endFrequency: 92, duration: 0.16, volume: 0.04, type: "sawtooth" },
    { frequency: 78, delay: 0.045, duration: 0.14, volume: 0.025, type: "square" },
  ],
  hint: [
    { frequency: 760, endFrequency: 980, duration: 0.14, volume: 0.025, type: "sine" },
    { frequency: 1240, delay: 0.12, duration: 0.2, volume: 0.02, type: "sine" },
  ],
  reset: [
    { frequency: 330, endFrequency: 155, duration: 0.18, volume: 0.03, type: "triangle" },
    { frequency: 230, delay: 0.08, duration: 0.09, volume: 0.02, type: "square" },
  ],
  success: [
    { frequency: 250, endFrequency: 320, duration: 0.14, volume: 0.035, type: "sawtooth" },
    { frequency: 440, delay: 0.09, duration: 0.17, volume: 0.035, type: "triangle" },
    { frequency: 660, delay: 0.18, duration: 0.24, volume: 0.04, type: "sine" },
    { frequency: 990, delay: 0.22, duration: 0.26, volume: 0.018, type: "sine" },
  ],
  complete: [
    { frequency: 294, duration: 0.18, volume: 0.035, type: "triangle" },
    { frequency: 440, delay: 0.11, duration: 0.2, volume: 0.035, type: "triangle" },
    { frequency: 587, delay: 0.22, duration: 0.23, volume: 0.038, type: "triangle" },
    { frequency: 880, delay: 0.34, duration: 0.42, volume: 0.04, type: "sine" },
    { frequency: 1175, delay: 0.39, duration: 0.38, volume: 0.018, type: "sine" },
  ],
};

function scheduleTone(context: AudioContext, tone: Tone) {
  const start = context.currentTime + (tone.delay ?? 0);
  const end = start + tone.duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = tone.type;
  oscillator.frequency.setValueAtTime(tone.frequency, start);
  if (tone.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, end);
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(tone.volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.01);
}

function playPattern(context: AudioContext, sound: GameSound) {
  PATTERNS[sound].forEach((tone) => scheduleTone(context, tone));
}

export function useGameAudio() {
  const [enabled, setEnabled] = useState(true);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const restorePreference = window.setTimeout(() => {
      try {
        setEnabled(window.localStorage.getItem(SOUND_STORAGE_KEY) !== "off");
      } catch {
        // Sound stays available when storage is blocked.
      }
    }, 0);

    return () => {
      window.clearTimeout(restorePreference);
      const context = contextRef.current;
      if (context && context.state !== "closed") void context.close();
    };
  }, []);

  const getContext = useCallback(() => {
    if (!contextRef.current && typeof window.AudioContext !== "undefined") {
      contextRef.current = new window.AudioContext();
    }
    return contextRef.current;
  }, []);

  const play = useCallback(
    (sound: GameSound) => {
      if (!enabled) return;
      const context = getContext();
      if (!context) return;

      if (context.state === "suspended") {
        void context.resume().then(() => playPattern(context, sound)).catch(() => undefined);
        return;
      }
      playPattern(context, sound);
    },
    [enabled, getContext],
  );

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off");
    } catch {
      // The in-memory preference still works when storage is blocked.
    }

    if (next) {
      const context = getContext();
      if (!context) return;
      if (context.state === "suspended") {
        void context.resume().then(() => playPattern(context, "good")).catch(() => undefined);
      } else {
        playPattern(context, "good");
      }
    }
  }, [enabled, getContext]);

  return useMemo(() => ({ enabled, play, toggle }), [enabled, play, toggle]);
}
