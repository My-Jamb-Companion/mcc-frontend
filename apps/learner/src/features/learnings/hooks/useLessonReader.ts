"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {DEFAULT_SPEED, firstItemFrom, playlist, readSpeed, type AudioManifest, type ListenKind} from "../helper/lessonAudio";
import {getAudioPart} from "../services/lessonAudio.service";

export type ReaderStatus = "idle" | "loading" | "playing" | "paused" | "error";

const SPEED_KEY = "lesson_listen_speed";

// One silent frame. Played inside the learner's tap to "unlock" the audio element: phones only let a page play sound
// from a tap, and the first part of a lesson takes a few seconds to arrive, by which time the tap is too old.
const SILENCE = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAA";

interface Options {
  kind: ListenKind;
  parentId: string;
  lectureId: string;
  manifest: AudioManifest;
  /** The section now being heard (also called when it moves on by itself), so the page can follow. */
  onSection: (section: number) => void;
}

/**
 * Plays a lesson's audio: parts in order through one audio element, the next part fetched while the current one plays
 * so there is no gap, the speed remembered between visits. It only plays; which page is showing is the caller's.
 */
export function useLessonReader({kind, parentId, lectureId, manifest, onSection}: Options) {
  const items = useMemo(() => playlist(manifest.sections), [manifest]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const urls = useRef(new Map<number, string>());
  const inflight = useRef(new Map<number, Promise<string>>());
  const cursor = useRef(-1);
  const run = useRef(0);
  const speedRef = useRef(DEFAULT_SPEED);
  const onSectionRef = useRef(onSection);
  onSectionRef.current = onSection;

  const [status, setStatus] = useState<ReaderStatus>("idle");
  const [section, setSection] = useState<number | null>(null);
  const [speed, setSpeedState] = useState(DEFAULT_SPEED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(SPEED_KEY);
    } catch {
      /* storage can be blocked */
    }
    const saved = readSpeed(stored);
    speedRef.current = saved;
    setSpeedState(saved);
  }, []);

  const load = useCallback(
    (i: number): Promise<string> => {
      const have = urls.current.get(i);
      if (have) return Promise.resolve(have);
      const pending = inflight.current.get(i);
      if (pending) return pending;
      const item = items[i];
      const promise = getAudioPart(kind, parentId, lectureId, item.section, item.part)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          urls.current.set(i, url);
          return url;
        })
        .finally(() => inflight.current.delete(i));
      inflight.current.set(i, promise);
      return promise;
    },
    [items, kind, parentId, lectureId],
  );

  const element = useCallback(() => {
    if (!audio.current) {
      audio.current = new Audio();
      audio.current.preload = "auto";
    }
    return audio.current;
  }, []);

  const playItem = useCallback(
    async (i: number) => {
      const token = ++run.current;
      const player = element();
      cursor.current = i;
      setError(null);
      setStatus("loading");
      setSection(items[i].section);
      onSectionRef.current(items[i].section);
      try {
        const url = await load(i);
        if (token !== run.current) return;
        player.src = url;
        player.playbackRate = speedRef.current;
        await player.play();
        if (token !== run.current) return;
        setStatus("playing");
        if (i + 1 < items.length) void load(i + 1).catch(() => undefined);
      } catch (e) {
        if (token !== run.current) return;
        setStatus("error");
        setError(e instanceof Error && e.message ? e.message : "Couldn't play the audio. Please try again.");
      }
    },
    [element, items, load],
  );

  // When a part ends, the next one starts; after the last, the reader is idle again.
  useEffect(() => {
    const player = element();
    const ended = () => {
      const next = cursor.current + 1;
      if (next < items.length) void playItem(next);
      else {
        run.current++;
        setStatus("idle");
      }
    };
    player.addEventListener("ended", ended);
    return () => player.removeEventListener("ended", ended);
  }, [element, items, playItem]);

  /** Start (or restart) from a section: its first part, or the next section that has any. */
  const playFrom = useCallback(
    (from: number) => {
      const i = firstItemFrom(items, from);
      if (i < 0) return;
      const player = element();
      // Inside the tap: let the element play, so the real audio can start when it arrives.
      player.src = SILENCE;
      void player.play().catch(() => undefined);
      void playItem(i);
    },
    [element, items, playItem],
  );

  const pause = useCallback(() => {
    audio.current?.pause();
    setStatus((s) => (s === "playing" ? "paused" : s));
  }, []);

  const resume = useCallback(() => {
    const player = audio.current;
    if (!player) return;
    void player.play().then(() => setStatus("playing"), () => setStatus("paused"));
  }, []);

  const stop = useCallback(() => {
    run.current++;
    audio.current?.pause();
    setStatus("idle");
    setError(null);
    setSection(null);
  }, []);

  const setSpeed = useCallback((value: number) => {
    speedRef.current = value;
    setSpeedState(value);
    if (audio.current) audio.current.playbackRate = value;
    try {
      window.localStorage.setItem(SPEED_KEY, String(value));
    } catch {
      /* storage can be blocked */
    }
  }, []);

  // Leaving the lesson silences it and frees the audio.
  useEffect(() => {
    const store = urls.current;
    const runs = run;
    return () => {
      runs.current++;
      audio.current?.pause();
      audio.current = null;
      store.forEach((url) => URL.revokeObjectURL(url));
      store.clear();
    };
  }, []);

  return {status, section, speed, error, playFrom, pause, resume, stop, setSpeed};
}
