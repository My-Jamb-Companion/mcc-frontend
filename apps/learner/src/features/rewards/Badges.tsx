"use client";

import {Icon} from "@mcc/ui";
import LevelBar from "./components/LevelBar";
import {useMyGamification} from "./hooks/useRewards";
import {sortBadges} from "./helper/badges";
import type {ApiBadge} from "./services/rewards.service";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"}) : "";

function BadgeCard({badge}: {badge: ApiBadge}) {
  const percent = Math.round((badge.progress / badge.target) * 100);
  return (
    <li
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${
        badge.earned ? "border-amber-300/60 bg-amber-50/60 dark:bg-amber-500/10" : "border-muted/25"
      }`}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          badge.earned ? "bg-amber-400 text-white" : "bg-muted/20 text-muted"
        }`}
        aria-hidden
      >
        <Icon icon={badge.earned ? "solar:medal-ribbons-star-bold" : "solar:lock-keyhole-minimalistic-bold"} size={28} />
      </span>
      <p className="text-sm font-semibold text-foreground">{badge.name}</p>
      <p className="text-xs leading-snug text-subtle">{badge.description}</p>
      {badge.earned ? (
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Earned {when(badge.earned_at)}</p>
      ) : (
        <div className="w-full">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted/25"
            role="progressbar"
            aria-label={`${badge.name} progress`}
            aria-valuemin={0}
            aria-valuemax={badge.target}
            aria-valuenow={badge.progress}
          >
            <div className="h-full rounded-full bg-primary" style={{width: `${percent}%`}} />
          </div>
          <p className="mt-1 text-xs text-subtle">{badge.progress}/{badge.target}</p>
        </div>
      )}
    </li>
  );
}

/** Level, XP and every badge: earned ones first, the rest with how close the student is. */
export default function Badges() {
  const {data, isLoading, isError} = useMyGamification();

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-muted/10" />;
  if (isError || !data) {
    return <p className="rounded-2xl border border-muted/25 p-4 text-sm text-subtle">Your badges couldn&apos;t be loaded. Please refresh.</p>;
  }

  const badges = sortBadges(data.badges);
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-muted/25 p-5">
        <LevelBar level={data.level} xp={data.xp} />
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Badges <span className="font-normal text-subtle">· {earned} of {badges.length} earned</span>
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((badge) => <BadgeCard key={badge.key} badge={badge} />)}
        </ul>
      </div>
    </div>
  );
}
