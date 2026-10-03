"use client";

export interface QuizSettings {
  /** Minutes allowed; undefined = untimed. */
  timer?: number;
  /** Percent needed to pass (0-100); undefined = no pass/fail. */
  passingScore?: number;
}

const toNumber = (raw: string): number | undefined => (raw === "" ? undefined : Number(raw));

/** The timer and passing-score fields shared by a course Quiz and an exam Test. */
export default function QuizSettingsFields({
  value,
  onChange,
  noun = "quiz",
}: {
  value: QuizSettings;
  onChange: (next: QuizSettings) => void;
  noun?: string;
}) {
  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Timer (minutes)</span>
        <input
          type="number"
          min={1}
          max={600}
          value={value.timer ?? ""}
          onChange={(e) => onChange({...value, timer: toNumber(e.target.value)})}
          placeholder="Optional: untimed if empty"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400"
        />
        <span className="text-xs text-gray-400">The student&apos;s {noun} is submitted automatically when time runs out.</span>
      </label>

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
        <span className="text-xs text-gray-400">Students see Passed or Not passed against this mark.</span>
      </label>
    </div>
  );
}
