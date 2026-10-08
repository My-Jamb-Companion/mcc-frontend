"use client";

import {Icon} from "@mcc/ui";
import type {ApiLevel} from "../services/rewards.service";

/** The student's level and how far they are to the next, as a labelled bar. */
export default function LevelBar({level, xp, className = ""}: {level: ApiLevel; xp: number; className?: string}) {
  const toNext = level.next_xp === null ? null : Math.max(0, level.next_xp - xp);
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-foreground">
          <Icon icon="solar:cup-star-bold" size={16} className="text-violet-600" />
          Level {level.level} · {level.name}
        </span>
        <span className="text-xs text-subtle">{xp.toLocaleString()} XP</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted/25"
        role="progressbar"
        aria-label="Progress to the next level"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={level.progress_percent}
      >
        <div className="h-full rounded-full bg-violet-600 transition-all" style={{width: `${level.progress_percent}%`}} />
      </div>
      <p className="mt-1 text-xs text-subtle">
        {toNext === null ? "You've reached the top level." : `${toNext.toLocaleString()} XP to ${level.next_name}`}
      </p>
    </div>
  );
}
