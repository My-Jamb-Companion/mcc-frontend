"use client";

import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from "react";
import {speechErrorMessage} from "../helper/voice";
import {
  applyResults,
  displayTranscript,
  EMPTY_TRANSCRIPT,
  type TranscriptState,
} from "../helper/transcript";
import {getRecognitionCtor, type Recognition} from "./speechRecognition";

const subscribeNever = () => () => {};

// Chrome ends a recognition session on its own after a spell of silence (and
// every minute or so regardless); for a lecture we want to keep going, so the
// recorder restarts it. A burst of restarts that each die immediately means
// something is genuinely wrong, so give up instead of looping.
const RESTART_DELAY_MS = 250;
const RAPID_RESTART_WINDOW_MS = 2000;
const MAX_RAPID_RESTARTS = 5;

export type RecorderStatus = "idle" | "recording" | "paused";

/**
 * Live lecture capture using the browser's speech recognition. It hears this
 * device's microphone only (not other tabs or system audio), is free, and is
 * unavailable in Firefox -- `supported` says which.
 */
export function useLectureRecorder(lang = "en-NG") {
  const supported = useSyncExternalStore(
    subscribeNever,
    () => getRecognitionCtor() !== null,
    () => false,
  );

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptState>(EMPTY_TRANSCRIPT);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<Recognition | null>(null);
  // Whether the *student* wants recording on, as opposed to whether the engine
  // happens to be running at this instant (it stops and restarts by itself).
  const wantRef = useRef(false);
  const restartTimes = useRef<number[]>([]);
  const startEngineRef = useRef<() => void>(() => {});

  const stopEngine = useCallback(() => {
    wantRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  const startEngine = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) =>
      setTranscript((current) => applyResults(current, event.results, event.resultIndex));

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are ordinary in a lecture hall; keep going.
      const message = speechErrorMessage(event.error);
      if (event.error === "no-speech" || event.error === "aborted" || !message) return;
      wantRef.current = false;
      setError(message);
      setStatus("paused");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      // The engine stopped; commit the guess we were showing so nothing the
      // student already saw is lost.
      setTranscript((t) => (t.interim ? {final: displayTranscript(t), interim: ""} : t));
      if (!wantRef.current) return;

      const now = Date.now();
      restartTimes.current = [...restartTimes.current.filter((t) => now - t < RAPID_RESTART_WINDOW_MS), now];
      if (restartTimes.current.length > MAX_RAPID_RESTARTS) {
        wantRef.current = false;
        setError("Recording keeps stopping. Check your microphone and try again.");
        setStatus("paused");
        return;
      }
      window.setTimeout(() => wantRef.current && startEngineRef.current(), RESTART_DELAY_MS);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      wantRef.current = false;
      setError("Recording couldn't start. Please try again.");
      setStatus("paused");
    }
  }, [lang]);

  useEffect(() => {
    startEngineRef.current = startEngine;
  }, [startEngine]);

  const start = useCallback(() => {
    setError(null);
    restartTimes.current = [];
    wantRef.current = true;
    setStatus("recording");
    startEngine();
  }, [startEngine]);

  const pause = useCallback(() => {
    stopEngine();
    setStatus("paused");
  }, [stopEngine]);

  const reset = useCallback(() => {
    stopEngine();
    setTranscript(EMPTY_TRANSCRIPT);
    setElapsed(0);
    setError(null);
    setStatus("idle");
  }, [stopEngine]);

  /** The student edited the text by hand: that becomes the committed transcript. */
  const setText = useCallback((text: string) => setTranscript({final: text, interim: ""}), []);

  useEffect(() => {
    if (status !== "recording") return;
    const timer = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  // Release the microphone if the screen is left mid-recording.
  useEffect(
    () => () => {
      wantRef.current = false;
      recognitionRef.current?.abort();
    },
    [],
  );

  return {
    supported,
    status,
    elapsed,
    error,
    text: displayTranscript(transcript),
    start,
    pause,
    reset,
    setText,
  };
}
