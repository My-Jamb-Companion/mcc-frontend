"use client";

import {useCallback, useEffect, useRef, useState, useSyncExternalStore} from "react";
import {speechErrorMessage} from "../helper/voice";

// lib.dom does not ship the Web Speech API types, and it is still prefixed in
// Chrome and Safari, so the slice we use is declared here.
interface RecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: {readonly transcript: string};
}
interface RecognitionEvent {
  readonly results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: {error: string}) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const subscribeNever = () => () => {};

interface Options {
  /** Called with everything heard so far in this utterance (interim, then final). */
  onTranscript: (spoken: string) => void;
  /** BCP-47 tag. Nigerian English by default -- the audience for Brainy. */
  lang?: string;
}

/**
 * Browser speech-to-text for the Brainy prompt. Free and on-device/in-browser;
 * Firefox has no implementation, so `supported` is false there and the caller
 * should disable the control rather than let it look broken.
 */
export function useSpeechInput({onTranscript, lang = "en-NG"}: Options) {
  // useSyncExternalStore, not state set in an effect: false on the server and
  // during hydration, the real answer afterwards, with no mismatch.
  const supported = useSyncExternalStore(
    subscribeNever,
    () => getRecognitionCtor() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let heard = "";
      for (let i = 0; i < event.results.length; i++) heard += event.results[i][0].transcript;
      onTranscriptRef.current(heard);
    };
    recognition.onerror = (event) => setError(speechErrorMessage(event.error));
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    setError(null);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if the browser still considers a previous session live.
      recognitionRef.current = null;
      setError("Voice input couldn't start. Please try again.");
    }
  }, [lang]);

  const toggle = useCallback(() => (listening ? stop() : start()), [listening, start, stop]);

  // Release the microphone if the card unmounts mid-recording.
  useEffect(() => () => recognitionRef.current?.abort(), []);

  return {supported, listening, error, start, stop, toggle};
}
