"use client";

import Link from "next/link";
import {Icon} from "@mcc/ui";
import {useGoalsSummary, useRewardsBalance} from "../hooks/useRewards";

function Stat({icon, label, value, accent}: {icon: string; label: string; value: string; accent?: string}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-muted/25 px-3 py-2.5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent ?? "bg-violet-50 text-violet-600"}`}>
        <Icon icon={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-bold leading-tight text-foreground">{value}</span>
        <span className="block truncate text-[11px] font-medium text-subtle">{label}</span>
      </span>
    </div>
  );
}

/** Streak, points, gems and today's goal, on the dashboard, with a way through to Rewards. */
export default function GamificationStrip() {
  const {data: summary} = useGoalsSummary();
  const {data: balance} = useRewardsBalance();
  const daily = summary?.daily;

  return (
    <Link href="/rewards" aria-label="Your progress and rewards" className="mt-5 block">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat icon="solar:bolt-bold" label="Day streak" value={String(summary?.streak.current_streak ?? 0)} />
        <Stat
          icon="solar:target-bold" label="Today's goal"
          value={daily ? `${Math.min(daily.earned, daily.target)}/${daily.target}` : "0/3"}
          accent={daily?.status === "achieved" ? "bg-green-50 text-green-600" : undefined}
        />
        <Stat icon="solar:medal-star-bold" label="Points" value={(balance?.total_points ?? 0).toLocaleString()} accent="bg-amber-50 text-amber-600" />
        <Stat icon="ri:vip-diamond-fill" label="Gems" value={(balance?.total_gems ?? 0).toLocaleString()} accent="bg-sky-50 text-sky-600" />
      </div>
    </Link>
  );
}
