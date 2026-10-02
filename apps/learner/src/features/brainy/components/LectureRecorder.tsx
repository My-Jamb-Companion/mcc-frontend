"use client";

import {Icon} from "@mcc/ui";
import {formatDuration} from "../helper/transcript";
import type {useLectureRecorder} from "../hooks/useLectureRecorder";

type Recorder = ReturnType<typeof useLectureRecorder>;

/** Controls for live lecture capture. The transcript itself is edited in the workbench's textarea. */
export default function LectureRecorder({recorder}: {recorder: Recorder}) {
  const {supported, status, elapsed, error, start, pause, reset, text} = recorder;
  const recording = status === "recording";

  if (!supported) {
    return (
      <div className="mt-4 rounded-2xl border-2 border-muted/20 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900">Recording isn&apos;t available in this browser</p>
        <p className="mt-1">
          Live recording needs Chrome, Edge or Safari. You can still paste a transcript below and
          make flashcards from it.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-muted/20 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={recording ? pause : start}
          aria-label={recording ? "Pause recording" : status === "paused" ? "Resume recording" : "Start recording"}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105 ${
            recording ? "animate-pulse bg-red-500" : "bg-purple-600"
          }`}
        >
          <Icon icon={recording ? "ph:pause-fill" : "ph:microphone"} size={24} />
        </button>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            {recording ? "Recording…" : status === "paused" ? "Paused" : "Ready to record"}
          </p>
          <p className="text-xs tabular-nums text-gray-500" aria-live="off">
            {formatDuration(elapsed)}
          </p>
        </div>

        {(status === "paused" || text) && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-xs font-medium text-gray-500 hover:text-red-500"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Brainy listens through this device&apos;s microphone only, so place it near the speaker and
        keep this tab open. Speech recognition isn&apos;t perfect — fix any mistakes in the text
        below before making flashcards.
      </p>
    </div>
  );
}
