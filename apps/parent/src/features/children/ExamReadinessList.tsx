import type { ChildExamReadiness } from "./children.service";

/** "62% – 71%", or null while there is not enough practice to say. */
export const predictedText = (p: ChildExamReadiness["predicted"]): string | null =>
  !p.available || p.low === null || p.high === null ? null : p.low === p.high ? `${p.low}%` : `${p.low}% – ${p.high}%`;

/** How ready a child is for each exam they are preparing for, and the score their practice suggests. */
export const ExamReadinessList = ({ programs, childName }: { programs: ChildExamReadiness[]; childName: string }) => (
  <ul className="space-y-2">
    {programs.map((program) => {
      const range = predictedText(program.predicted);
      const name = [program.exam_name, program.subject_name].filter(Boolean).join(" — ") || "Exam prep program";
      return (
        <li key={program.program_id} className="rounded-lg border border-muted/20 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium">{name}</p>
            <p className="text-sm font-semibold tabular-nums">{program.readiness_percent}% ready</p>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/20"
            role="progressbar"
            aria-label={`${name} readiness`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={program.readiness_percent}
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${program.readiness_percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {range
              ? `${childName}'s practice so far suggests a score of ${range}. It is an estimate and firms up as they answer more.`
              : program.predicted.message}
          </p>
        </li>
      );
    })}
  </ul>
);
