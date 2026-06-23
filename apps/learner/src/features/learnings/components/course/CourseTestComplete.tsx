"use client";

import {Icon} from "@mcc/ui";

interface SkillLevel {
  id: string;
  label: string;
  stars: number; // out of 5
}

interface CourseCompletionProps {
  modulesLeveledUp?: number;
  modulesFailed?: number;
  correctCount?: number;
  totalCount?: number;
  points?: number;
  diamondsEarned?: number;
  skillLevels?: SkillLevel[];
  onShowSummary?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
}

const DEFAULT_SKILL_LEVELS: SkillLevel[] = [
  {id: "1", label: "level #01", stars: 5},
  {id: "2", label: "level #02", stars: 5},
  {id: "3", label: "level #03", stars: 5},
];

function StarRating({stars, max = 5}: {stars: number; max?: number}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({length: max}).map((_, i) => (
        <Icon
          key={i}
          icon={i < stars ? "mdi:star" : "mdi:star-outline"}
          className={`h-4 w-4 ${i < stars ? "text-orange-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function CourseCompletion({
  modulesLeveledUp = 10,
  modulesFailed = 0,
  correctCount = 15,
  totalCount = 15,
  points = 475,
  diamondsEarned = 3,
  skillLevels = DEFAULT_SKILL_LEVELS,
  onShowSummary,
  onContinue,
  continueLabel = "Up next: Your certificate!",
}: CourseCompletionProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#111112]">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* Left panel */}
        <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden bg-primary/90 px-8 py-12 text-center">
          {/* Decorative asterisk, subtle, bottom-right */}
          <Icon
            icon="mdi:asterisk"
            className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 text-white/10"
          />

          <div className="relative z-10 space-y-4">
            <p className="text-sm font-semibold text-white">
              Leveled up on{" "}
              <span className="font-normal text-white/80">
                {modulesLeveledUp} Modules
              </span>
            </p>
            <p className="text-sm font-semibold text-white">
              Failed to pass on{" "}
              <span className="font-normal text-white/80">
                {modulesFailed} Modules
              </span>
            </p>

            <p className="pt-2 text-lg font-bold text-white">
              {correctCount}/{totalCount} correct{" "}
              <span className="font-normal text-white/70">&bull;</span> {points}{" "}
              points
            </p>

            <p className="flex items-center justify-center gap-1 text-sm text-white/80">
              You have earned
              <Icon icon="mdi:diamond" className="h-4 w-4 text-cyan-300" />
              <span className="font-semibold text-white">
                {diamondsEarned} Diamonds
              </span>
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="px-8 py-10">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Skill mastery level
          </h3>

          <div className="mt-6">
            {skillLevels.map((level, idx) => (
              <div
                key={level.id}
                className={`flex items-center justify-between py-4 ${
                  idx !== skillLevels.length - 1
                    ? "border-b border-gray-100 dark:border-gray-700"
                    : ""
                }`}
              >
                <span className="text-sm text-gray-500">{level.label}</span>
                <StarRating stars={level.stars} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-8 py-5">
        <button
          type="button"
          onClick={onShowSummary}
          className="text-sm font-semibold text-gray-800 hover:text-gray-900 dark:hover:text-gray-300 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 cursor-pointer"
        >
          Show summary
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-primary dark:bg-primary/80 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/70 dark:hover:bg-primary/60 cursor-pointer"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
