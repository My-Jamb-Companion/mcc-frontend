"use client";

export interface QuizSettings {
  /** Minutes allowed; undefined = untimed. */
  timer?: number;
  /** Percent needed to pass (0-100); undefined = no pass/fail. */
  passingScore?: number;
}

const toNumber = (raw: string): number | undefined => (raw === "" ? undefined : Number(raw));

/** Quick picks for the countdown; any other length can be typed in. */
export const TIMER_PRESETS = [5, 10, 15, 20, 30, 45, 60];

/**
 * The countdown and passing-score fields shared by a course Test, a course Smart Zone and an exam Smart Zone.
 * A Smart Zone has no pass/fail in a course, so it hides the passing score.
 */
export default function QuizSettingsFields({
  value,
  onChange,
  noun = "quiz",
  hidePassingScore = false,
}: {
  value: QuizSettings;
  onChange: (next: QuizSettings) => void;
  noun?: string;
  hidePassingScore?: boolean;
}) {
  return (
    <div className={`mb-4 grid gap-4 ${hidePassingScore ? "" : "md:grid-cols-2"}`}>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Countdown timer (minutes)</span>
        <input
          type="number"
          min={1}
          max={600}
          value={value.timer ?? ""}
          onChange={(e) => onChange({...value, timer: toNumber(e.target.value)})}
          placeholder="Optional: untimed if empty"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400"
        />
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Quick timer lengths">
          {TIMER_PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={value.timer === minutes}
              onClick={() => onChange({...value, timer: value.timer === minutes ? undefined : minutes})}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                value.timer === minutes
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {minutes} min
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">
          The student&apos;s {noun} shows a countdown with a tick in the last 10 seconds and an alarm at zero, and is
          submitted automatically when time runs out.
        </span>
      </label>

      {!hidePassingScore && (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Passing score (%)</span>
        <input
          type="number"
          min={0}
          max={100}
          value={value.passingScore ?? ""}
          onChange={(e) => onChange({...value, passingScore: toNumber(e.target.value)})}
          placeholder="Optional: no pass/fail if empty"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400"
        />
        <span className="text-xs text-gray-500">Students see Passed or Not passed against this mark.</span>
      </label>
      )}
    </div>
  );
}
