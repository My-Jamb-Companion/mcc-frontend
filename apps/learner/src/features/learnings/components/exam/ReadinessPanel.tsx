"use client";
import {useState} from "react";
import {Icon} from "@mcc/ui";
import type {ApiProgramReadiness, ApiReadinessTile, ApiWeakTopic} from "@/src/features/exams/services/exam.service";
import {
  confidenceNote,
  LEVEL_LABEL,
  LEVEL_ORDER,
  LEVEL_STYLE,
  predictedRange,
  tileSummary,
} from "@/src/features/learnings/helper/readiness";

interface ReadinessPanelProps {
  readiness: ApiProgramReadiness;
  /** A tile or a weak topic was chosen: practise it. */
  onPractise: (node: {node_type: "module" | "sub_topic"; node_id: string}) => void;
  /** A lecture to revisit was chosen. */
  onOpenLecture: (lectureId: string) => void;
}

/**
 * Where the student stands in the program: Exam Readiness, the predicted score range, a tile for each topic
 * coloured by level (a star marks a sub-topic's own unit Exercise), and the topics worth another go.
 */
export default function ReadinessPanel({readiness, onPractise, onOpenLecture}: ReadinessPanelProps) {
  const [open, setOpen] = useState(false);
  const range = predictedRange(readiness.predicted);
  const note = confidenceNote(readiness.predicted);

  return (
    <section aria-label="Exam readiness" className="mx-4 mb-6 rounded-2xl border border-muted/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold">
            Exam readiness: {readiness.readiness_percent}%
            <span
              title="How much of this program you have mastered: the share of each topic's questions you've played, times the share you got right first time (no hint, no skip), averaged across topics."
              className="text-subtle"
            >
              <Icon icon="ph:info" size={16} />
            </span>
          </h2>
          <div
            className="mt-2 h-2 w-56 max-w-full overflow-hidden rounded-full bg-muted/20"
            role="progressbar" aria-label="Exam readiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={readiness.readiness_percent}
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{width: `${readiness.readiness_percent}%`}} />
          </div>
        </div>

        <div className="rounded-xl bg-primary/5 px-4 py-3 text-sm" aria-label="Predicted score">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Predicted score</p>
          {range ? (
            <>
              <p className="text-xl font-extrabold text-primary">{range}</p>
              {note && <p className="max-w-[16rem] text-xs text-subtle">{note}</p>}
            </>
          ) : (
            <p className="max-w-[16rem] text-xs text-subtle">{readiness.predicted.message}</p>
          )}
        </div>
      </div>

      {readiness.weakest.length > 0 && <WeakTopics topics={readiness.weakest} onPractise={onPractise} onOpenLecture={onOpenLecture} />}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="ph:caret-down" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        {open ? "Hide" : "Show"} topic levels
      </button>

      {open && (
        <div className="mt-4">
          <Legend />
          <ul className="mt-4 flex flex-col gap-4">
            {readiness.units.map((unit) => (
              <li key={unit.sub_topic_id} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="w-44 shrink-0 truncate text-sm font-medium" title={unit.title}>{unit.title}</span>
                <span className="flex flex-wrap gap-1.5">
                  {unit.tiles.map((tile) => (
                    <Tile key={tile.node_id} tile={tile} onPractise={onPractise} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Tile({tile, onPractise}: {tile: ApiReadinessTile; onPractise: ReadinessPanelProps["onPractise"]}) {
  return (
    <button
      type="button"
      title={tileSummary(tile)}
      aria-label={tileSummary(tile)}
      onClick={() => onPractise(tile)}
      className={`flex h-7 w-7 items-center justify-center rounded-lg text-white transition-transform hover:scale-110 ${LEVEL_STYLE[tile.level]}`}
    >
      {tile.node_type === "sub_topic" ? (
        <Icon icon="solar:star-bold" size={13} className={tile.level === "not_started" ? "text-muted/60" : "text-white"} />
      ) : tile.level === "ready" ? (
        <Icon icon="solar:crown-bold" size={13} />
      ) : null}
    </button>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle" aria-label="Levels">
      {LEVEL_ORDER.map((level) => (
        <li key={level} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded ${LEVEL_STYLE[level]}`} />
          {LEVEL_LABEL[level]}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <Icon icon="solar:star-bold" size={12} /> A sub-topic&apos;s own Smart Zone
      </li>
    </ul>
  );
}

function WeakTopics({topics, onPractise, onOpenLecture}: {topics: ApiWeakTopic[]} & Pick<ReadinessPanelProps, "onPractise" | "onOpenLecture">) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold">Practise these next</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {topics.map((t) => (
          <li key={t.node_id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-muted/20 px-4 py-2.5">
            <span className="min-w-0 text-sm">
              <span className="font-medium">{t.title}</span>
              <span className="ml-2 text-xs text-subtle">{LEVEL_LABEL[t.level]}</span>
            </span>
            <span className="flex gap-2">
              {t.lecture_id && (
                <button type="button" onClick={() => onOpenLecture(t.lecture_id as string)}
                  className="rounded-full border border-muted/20 px-3 py-1 text-xs font-semibold hover:bg-muted/5">
                  Revisit the lesson
                </button>
              )}
              <button type="button" onClick={() => onPractise(t)}
                className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                Practise
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
