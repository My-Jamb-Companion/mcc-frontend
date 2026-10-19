import {Icon} from "@mcc/ui";
import {minutesLabel} from "@/src/features/learnings/helper/assessmentFlow";

/** "Time for a Course test?": what a Test is, how long it takes, and the start button. */
export default function CourseTestIntro({
  questionCount, timerMinutes, passingScore, onStart,
}: {
  questionCount: number;
  timerMinutes?: number | null;
  passingScore?: number | null;
  onStart: () => void;
}) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl">
      <div className="bg-primary-gradient px-6 py-12 text-center text-white">
        <Icon icon="solar:medal-ribbons-star-bold-duotone" size={56} className="mx-auto mb-4 opacity-90" />
        <h2 className="font-bagel text-3xl">Time for a Course test?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-90">Get ready for questions on what you have covered so far.</p>
        <p className="mt-5 text-lg font-semibold">
          {questionCount} question{questionCount === 1 ? "" : "s"} <span className="mx-2 opacity-70">•</span>{" "}
          {timerMinutes ? minutesLabel({min: timerMinutes, max: timerMinutes}) : minutesLabel({min: questionCount, max: questionCount * 2})}
        </p>
        {passingScore !== null && passingScore !== undefined && <p className="mt-2 text-sm opacity-90">Pass mark: {passingScore}%</p>}
      </div>
      <div className="flex justify-end border border-t-0 border-muted/20 bg-muted/5 px-6 py-4">
        <button type="button" onClick={onStart} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Let&apos;s go
        </button>
      </div>
    </div>
  );
}
