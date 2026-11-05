"use client";

import {useEffect, useMemo, useState} from "react";
import {Modal} from "@mcc/ui";
import {useAudioStatus, usePregenerate} from "../hooks/useLessonAudio";
import type {AudioKind} from "../services/lessonAudio.service";
import {
  allNeeding,
  buildTasks,
  exceedsAllowance,
  formatChars,
  needsAudio,
  percentDone,
  remainingToday,
  stateLabel,
  toggled,
  totalChars,
  lessonState,
} from "../helper/pregenerate";

interface LessonAudioModalProps {
  open: boolean;
  onClose: () => void;
  kind: AudioKind;
  parentId: string;
  /** What this is the audio of, for the heading. */
  name: string;
}

const STATE_STYLE = {
  ready: "bg-emerald-500/15 text-emerald-700",
  partial: "bg-amber-500/15 text-amber-700",
  none: "bg-muted/15 text-muted",
} as const;

/**
 * Make "Listen to this lesson" audio in advance. Learners' first listen to a lesson otherwise makes it then (a few
 * seconds' wait, and it uses the voice account's credits at that moment); here the admin chooses which lessons to make
 * ahead, sees what it will use before starting, and can stop at any point.
 */
export default function LessonAudioModal({open, onClose, kind, parentId, name}: LessonAudioModalProps) {
  const {data: status, isLoading, isError, refetch} = useAudioStatus(kind, parentId, open);
  const run = usePregenerate(kind, parentId);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelected(new Set());
      run.reset();
      void refetch();
    }
    // Opening is the only reason to start over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const tasks = useMemo(() => (status ? buildTasks(status, selected) : []), [status, selected]);
  const chars = totalChars(tasks);
  const running = run.state.running;
  const over = status ? exceedsAllowance(status, tasks) : false;

  function close() {
    run.stop();
    onClose();
  }

  return (
    <Modal open={open} title="Lesson audio" maxWidth="max-w-3xl">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Make the spoken audio for <span className="font-medium text-foreground">{name}</span> now, so learners can press Listen
          and hear it straight away. Audio that is not made yet is made the first time a learner asks for it. It uses the lessons as last saved, so save your changes first.
        </p>

        {isLoading && <p className="py-8 text-center text-sm text-muted">Checking the lessons…</p>}
        {isError && <p className="py-8 text-center text-sm text-red-600">Couldn&apos;t load the lessons. Please try again.</p>}

        {status && !status.configured && (
          <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-foreground">
            The voice is not set up on the server yet (no <code>TTS_API_KEY</code>), so nothing can be made. Learners see no Listen button until it is.
          </div>
        )}

        {status && status.configured && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
            {status.voice && (
              <span>
                Voice: <span className="text-foreground">{status.voice.provider} · {status.voice.model} · {status.voice.voice}</span>
              </span>
            )}
            <span>
              Today: <span className="text-foreground">{formatChars(status.spent_today)}</span> of {formatChars(status.daily_limit)} characters used
            </span>
          </div>
        )}

        {status && status.lectures.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">This has no text lessons. Video, YouTube and PDF lessons have no audio.</p>
        )}

        {status && status.lectures.length > 0 && (
          <>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                disabled={running || !status.configured || !status.lectures.some(needsAudio)}
                onClick={() => setSelected(allNeeding(status, selected))}
                className="font-medium text-primary hover:underline disabled:opacity-40 disabled:no-underline"
              >
                {status.lectures.filter(needsAudio).every((l) => selected.has(l.lecture_id)) && selected.size > 0 ? "Clear selection" : "Select everything that needs audio"}
              </button>
              <span className="text-xs text-muted">
                {status.totals.lectures - status.lectures.filter(needsAudio).length} of {status.totals.lectures} lessons ready
              </span>
            </div>

            <ul className="max-h-[40vh] divide-y divide-muted/20 overflow-y-auto rounded-xl border border-muted/30">
              {status.lectures.map((l) => {
                const needs = needsAudio(l);
                return (
                  <li key={l.lecture_id}>
                    <label className={`flex items-center gap-3 px-3 py-2.5 ${needs && !running ? "cursor-pointer hover:bg-muted/10" : "opacity-70"}`}>
                      <input
                        type="checkbox"
                        checked={selected.has(l.lecture_id)}
                        disabled={!needs || running || !status.configured}
                        onChange={() => setSelected((s) => toggled(s, l.lecture_id))}
                        className="h-4 w-4 rounded border-muted/40 accent-violet-600"
                        aria-label={`Make audio for ${l.title}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{l.title}</span>
                        <span className="block truncate text-xs text-muted">
                          {l.module_title ? `${l.module_title} · ` : ""}
                          {l.sections} section{l.sections === 1 ? "" : "s"} · {formatChars(l.chars)} characters
                        </span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATE_STYLE[lessonState(l)]}`}>{stateLabel(l)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {(running || run.state.finished) && (
          <div className="flex flex-col gap-2 rounded-xl border border-muted/30 p-3" aria-live="polite">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/20">
              <div className="h-full bg-primary transition-all" style={{width: `${percentDone(run.state.done + run.state.failures.length, run.state.total)}%`}} />
            </div>
            <p className="text-sm text-foreground">
              {running
                ? `Making audio… ${run.state.done} of ${run.state.total} parts${run.state.current ? ` · ${run.state.current}` : ""}`
                : `Made ${run.state.done} of ${run.state.total} parts (${formatChars(run.state.doneChars)} characters).`}
            </p>
            {run.state.stoppedBecause && (
              <p role="alert" className="text-sm text-amber-700">
                Stopped: {run.state.stoppedBecause} What was made is kept; run it again to carry on.
              </p>
            )}
            {run.state.failures.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-red-600">
                {run.state.failures.slice(0, 5).map((f, i) => (
                  <li key={i}>
                    {f.title}: {f.message}
                  </li>
                ))}
                {run.state.failures.length > 5 && <li>and {run.state.failures.length - 5} more</li>}
              </ul>
            )}
          </div>
        )}

        {status && over && !running && (
          <p className="text-xs text-amber-700">
            This is more than today&apos;s remaining allowance ({formatChars(remainingToday(status))} characters). It will stop when the allowance is used up; run it again tomorrow, or raise the daily limit on the server.
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {tasks.length > 0 ? `${selected.size} lesson${selected.size === 1 ? "" : "s"} · ${tasks.length} parts · about ${formatChars(chars)} characters` : "Choose the lessons to make audio for."}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground">
              {running ? "Stop and close" : "Close"}
            </button>
            {running ? (
              <button type="button" onClick={run.stop} className="rounded-lg border border-muted/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/10">
                Stop
              </button>
            ) : (
              <button
                type="button"
                disabled={tasks.length === 0 || !status?.configured}
                onClick={() => void run.start(tasks)}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Make audio
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
