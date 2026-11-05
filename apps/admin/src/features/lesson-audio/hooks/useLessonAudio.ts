import {useCallback, useEffect, useRef, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getApiErrorMessage} from "@/src/features/categories/services/category.service";
import {generateAudioPart, getAudioStatus, type AudioKind} from "../services/lessonAudio.service";
import type {AudioTask} from "../helper/pregenerate";

const key = (kind: AudioKind, parentId: string) => ["admin-lesson-audio", kind, parentId];

export const useAudioStatus = (kind: AudioKind, parentId: string, enabled: boolean) =>
  useQuery({queryKey: key(kind, parentId), queryFn: () => getAudioStatus(kind, parentId), enabled, refetchOnWindowFocus: false});

export interface RunState {
  running: boolean;
  finished: boolean;
  total: number;
  done: number;
  doneChars: number;
  current: string | null;
  failures: {title: string; message: string}[];
  /** Why the whole run stopped early (the day's allowance used up, or the voice down), if it did. */
  stoppedBecause: string | null;
}

const INITIAL: RunState = {running: false, finished: false, total: 0, done: 0, doneChars: 0, current: null, failures: [], stoppedBecause: null};

// The voice account allows only a few requests at once, so two at a time is steady without being slow.
const WORKERS = 2;

/**
 * Makes audio part by part from the browser: each request is a few seconds, progress shows as it goes, and Stop really
 * stops (the parts already made stay made). A "service unavailable" answer (the day's allowance used up, or the voice
 * down) ends the run, since every other part would fail the same way; any other failure is listed and the run goes on.
 */
export function usePregenerate(kind: AudioKind, parentId: string) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<RunState>(INITIAL);
  const stopped = useRef(false);

  useEffect(() => () => {
    stopped.current = true;
  }, []);

  const start = useCallback(
    async (tasks: AudioTask[]) => {
      stopped.current = false;
      let next = 0;
      setState({...INITIAL, running: true, total: tasks.length});
      const worker = async () => {
        while (!stopped.current) {
          const task = tasks[next++];
          if (!task) return;
          setState((s) => ({...s, current: task.title}));
          try {
            await generateAudioPart(kind, parentId, task.lectureId, task.section, task.part);
            setState((s) => ({...s, done: s.done + 1, doneChars: s.doneChars + task.chars}));
          } catch (error) {
            const message = getApiErrorMessage(error, "That part couldn't be made.");
            const status = (error as {response?: {status?: number}})?.response?.status;
            if (status === 503) {
              stopped.current = true;
              setState((s) => ({...s, stoppedBecause: message}));
            } else {
              setState((s) => ({...s, failures: [...s.failures, {title: task.title, message}]}));
            }
          }
        }
      };
      await Promise.all(Array.from({length: WORKERS}, worker));
      setState((s) => ({...s, running: false, finished: true, current: null}));
      await queryClient.invalidateQueries({queryKey: key(kind, parentId)});
    },
    [kind, parentId, queryClient],
  );

  const stop = useCallback(() => {
    stopped.current = true;
  }, []);
  const reset = useCallback(() => setState(INITIAL), []);

  return {state, start, stop, reset};
}
