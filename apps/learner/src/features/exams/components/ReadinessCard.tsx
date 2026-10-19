"use client";
import Link from "next/link";
import {Icon} from "@mcc/ui";
import {useReadinessOverview} from "@/src/features/exams/hooks/useExams";
import {predictedRange} from "@/src/features/learnings/helper/readiness";

/** On the dashboard: how ready the student is for each exam they are preparing for, and the score that suggests. */
export default function ReadinessCard() {
  const {data: programs} = useReadinessOverview();
  if (!programs?.length) return null;

  return (
    <section aria-label="Exam readiness" className="mt-8">
      <h2 className="mb-3 text-lg font-bold">Exam readiness</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {programs.map((p) => {
          const range = predictedRange(p.predicted);
          const name = [p.exam_name, p.subject_name].filter(Boolean).join(" — ") || "Exam prep program";
          return (
            <li key={p.program_id}>
              <Link href={`/learnings/exams/${p.program_id}`}
                className="flex flex-col gap-2 rounded-2xl border border-muted/20 p-4 transition-colors hover:bg-muted/5">
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  <span className="truncate">{name}</span>
                  <Icon icon="ci:caret-right-sm" size={20} className="shrink-0 text-subtle" />
                </span>
                <span className="flex items-center gap-3">
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted/20" role="progressbar"
                    aria-label={`${name} readiness`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.readiness_percent}>
                    <span className="block h-full rounded-full bg-primary" style={{width: `${p.readiness_percent}%`}} />
                  </span>
                  <span className="text-sm font-bold tabular-nums">{p.readiness_percent}%</span>
                </span>
                <span className="text-xs text-subtle">
                  {range ? <>Predicted score <span className="font-semibold text-foreground">{range}</span></> : p.predicted.message}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
