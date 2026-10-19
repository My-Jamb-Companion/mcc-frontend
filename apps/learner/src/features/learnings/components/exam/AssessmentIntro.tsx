import {Icon} from "@mcc/ui";
import {minutesLabel} from "@/src/features/learnings/helper/assessmentFlow";
import type {ApiAssessmentSession} from "@/src/features/exams/services/exam.service";

/** "Time for an exercise?": what the Exercise is, how long it takes, and the start button. */
export default function AssessmentIntro({session, onStart}: {session: ApiAssessmentSession; onStart: () => void}) {
  const count = session.question_count;
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl">
      <div className="bg-primary-gradient px-6 py-12 text-center text-white">
        <Icon icon="solar:pen-new-square-bold-duotone" size={56} className="mx-auto mb-4 opacity-90" />
        <h2 className="font-bagel text-3xl">Time for an exercise?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-90">
          Get ready for questions on {session.title}. Take your time: you can retry a question and ask for hints.
        </p>
        <p className="mt-5 text-lg font-semibold">
          {count} question{count === 1 ? "" : "s"} <span className="mx-2 opacity-70">•</span> {minutesLabel(session.estimated_minutes)}
        </p>
        {(session.time_limit_minutes || session.passing_score !== null) && (
          <p className="mt-2 text-sm opacity-90">
            {session.time_limit_minutes ? `Time limit: ${session.time_limit_minutes} minutes` : ""}
            {session.time_limit_minutes && session.passing_score !== null ? " · " : ""}
            {session.passing_score !== null ? `Pass mark: ${session.passing_score}%` : ""}
          </p>
        )}
      </div>
      <div className="flex justify-end border border-t-0 border-muted/20 bg-muted/5 px-6 py-4">
        <button type="button" onClick={onStart} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Let&apos;s go
        </button>
      </div>
    </div>
  );
}
