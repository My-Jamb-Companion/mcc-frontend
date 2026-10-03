"use client";

import {useRef, useState} from "react";
import {Icon} from "@mcc/ui";
import {MAX_SCREENSHOTS} from "../helper/studyMaterial";
import type {useScreenshots} from "../hooks/useScreenshots";

type Attached = ReturnType<typeof useScreenshots>;

/** Optional screenshots of the lecture's slides or board; Brainy reads them alongside the transcript. */
export default function ScreenshotAttachments({attached}: {attached: Attached}) {
  const {shots, notice, add, remove, setText, full} = attached;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (list: FileList | null) => {
    if (list?.length) add(Array.from(list));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section aria-label="Lecture screenshots" className="mt-4 rounded-2xl border-2 border-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Slides &amp; screenshots <span className="font-normal text-gray-400">(optional)</span>
          </h2>
          <p className="text-xs text-gray-500">
            Add up to {MAX_SCREENSHOTS} pictures from the lecture. Brainy reads them and uses them
            with what you recorded. Each one uses a little of your Brainy allowance.
          </p>
        </div>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            full
              ? "pointer-events-none border-muted/20 text-gray-400"
              : dragging
                ? "border-purple-400 bg-purple-50 text-purple-700"
                : "border-purple-300 text-purple-700 hover:bg-purple-50"
          }`}
        >
          <Icon icon="ph:image" size={16} />
          {full ? "Limit reached" : "Add screenshots"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={full}
            className="sr-only"
            onChange={(e) => pick(e.target.files)}
          />
        </label>
      </div>

      {notice && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {notice}
        </p>
      )}

      {shots.length > 0 && (
        <ul className="mt-3 space-y-2">
          {shots.map((shot) => (
            <li key={shot.id} className="rounded-xl border border-muted/20 p-2">
              <div className="flex items-center gap-3">
                <img src={shot.previewUrl} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{shot.name}</p>
                  {shot.status === "reading" && (
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Icon icon="svg-spinners:180-ring-with-bg" size={12} />
                      Reading…
                    </p>
                  )}
                  {shot.status === "ready" && (
                    <p role="status" className="text-xs text-green-600">
                      Read {shot.text.length.toLocaleString()} characters
                      {shot.paid ? ` · ${shot.paid}` : ""}
                    </p>
                  )}
                  {shot.status === "failed" && (
                    <p role="alert" className="text-xs text-red-500">
                      {shot.error}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(shot.id)}
                  aria-label={`Remove ${shot.name}`}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Icon icon="ph:x" size={16} />
                </button>
              </div>
              {shot.status === "ready" && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-purple-700">
                    Check the text Brainy read
                  </summary>
                  <textarea
                    value={shot.text}
                    onChange={(e) => setText(shot.id, e.target.value)}
                    aria-label={`Text read from ${shot.name}`}
                    rows={4}
                    className="mt-2 w-full resize-y rounded-lg border border-muted/20 p-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  />
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
