"use client";

import {useEffect, useRef} from "react";
import {Icon} from "@mcc/ui";
import {canListen, nextSpeed, sectionLabel, type AudioManifest, type ListenKind} from "../helper/lessonAudio";
import {useLessonAudioManifest} from "../hooks/useLessonAudioManifest";
import {useLessonReader} from "../hooks/useLessonReader";

export interface ListenTarget {
  kind: ListenKind;
  /** The course's or exam-prep program's id. */
  parentId: string;
  lectureId: string;
}

interface LessonListenProps extends ListenTarget {
  /** How many pages the lesson has on screen (one per section). */
  pages: number;
  /** The page the learner is on. */
  page: number;
  /** Take the lesson to this page. */
  onGoToPage: (page: number) => void;
}

/**
 * "Listen to this lesson". Shows nothing unless the server can speak the lesson (hosted voice is set up, the learner has
 * access and the lesson is text). The audio follows the pages: it reads the section on screen, turns the page as it
 * moves on, and if the learner turns the page themselves it carries on from there.
 */
export default function LessonListen({kind, parentId, lectureId, pages, page, onGoToPage}: LessonListenProps) {
  const {data} = useLessonAudioManifest(kind, parentId, lectureId);
  if (!canListen(data, pages)) return null;
  return <Player manifest={data!} kind={kind} parentId={parentId} lectureId={lectureId} pages={pages} page={page} onGoToPage={onGoToPage} />;
}

function Player({manifest, kind, parentId, lectureId, pages, page, onGoToPage}: LessonListenProps & {manifest: AudioManifest}) {
  // The page the audio itself asked for, so turning to it is not mistaken for the learner turning the page.
  const commanded = useRef<number | null>(null);
  const reader = useLessonReader({
    kind,
    parentId,
    lectureId,
    manifest,
    onSection: (section) => {
      commanded.current = section;
      onGoToPage(section);
    },
  });
  const {status, speed, error, playFrom, pause, resume, stop, setSpeed} = reader;
  const active = status !== "idle";

  // The learner turned the page while listening: carry on from the page they are on. Past the last section, stop.
  useEffect(() => {
    if (status === "idle" || status === "error") return;
    if (page === commanded.current) return;
    commanded.current = page;
    if (page >= pages) stop();
    else playFrom(page);
    // Only a change of page is a reason to act, not a change of status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const current = reader.section ?? page;
  const move = (by: -1 | 1) => playFrom(Math.max(0, Math.min(pages - 1, current + by)));

  if (!active) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => playFrom(page < pages ? page : 0)}
          className="flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 cursor-pointer"
        >
          <Icon icon="ph:headphones" size={18} />
          Listen to this lesson
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Lesson audio"
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2"
    >
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Previous section"
        disabled={current <= 0}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-primary/10 disabled:opacity-30 cursor-pointer"
      >
        <Icon icon="ph:skip-back-fill" size={18} />
      </button>

      {status === "loading" ? (
        <span className="flex h-10 w-10 items-center justify-center" aria-label="Preparing audio">
          <Icon icon="line-md:loading-loop" size={22} className="text-primary" />
        </span>
      ) : (
        <button
          type="button"
          onClick={status === "playing" ? pause : status === "error" ? () => playFrom(current) : resume}
          aria-label={status === "playing" ? "Pause" : status === "error" ? "Try again" : "Play"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white hover:opacity-90 cursor-pointer"
        >
          <Icon icon={status === "playing" ? "ph:pause-fill" : status === "error" ? "ph:arrow-clockwise" : "ph:play-fill"} size={20} />
        </button>
      )}

      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Next section"
        disabled={current >= pages - 1}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-primary/10 disabled:opacity-30 cursor-pointer"
      >
        <Icon icon="ph:skip-forward-fill" size={18} />
      </button>

      <div className="min-w-0 flex-1 px-1">
        <p className="truncate text-sm font-medium text-foreground">
          {status === "loading" ? "Preparing the audio…" : sectionLabel(current, pages)}
        </p>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setSpeed(nextSpeed(speed))}
        aria-label={`Speed ${speed} times. Change speed`}
        className="rounded-full border border-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary/10 cursor-pointer"
      >
        {speed}×
      </button>

      <button
        type="button"
        onClick={stop}
        aria-label="Stop listening"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-primary/10 cursor-pointer"
      >
        <Icon icon="ph:x" size={16} />
      </button>
    </div>
  );
}
