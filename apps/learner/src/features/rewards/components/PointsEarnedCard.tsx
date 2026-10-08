"use client";

import {useEffect, useRef} from "react";
import Link from "next/link";
import {Icon, confettiCelebrate} from "@mcc/ui";
import {pointsHeadline, shouldCelebrate} from "../helper/earnings";
import type {ApiGamificationUpdate} from "../services/rewards.service";

/**
 * What the quiz just earned: points, the day's goal, the streak, and anything waiting to be
 * claimed. Throws confetti when the daily goal is reached.
 */
export default function PointsEarnedCard({gamification, scorePercent}: {gamification: ApiGamificationUpdate; scorePercent: number}) {
  const ref = useRef<HTMLDivElement>(null);
  const headline = pointsHeadline(gamification, scorePercent);
  const goal = gamification.daily_goal;
  const celebrate = shouldCelebrate(gamification);

  useEffect(() => {
    if (celebrate && ref.current) confettiCelebrate(ref.current);
  }, [celebrate]);

  return (
    <div ref={ref} className="mt-6 w-full max-w-md rounded-2xl border border-muted/30 bg-background p-4 text-left" aria-label="What you earned">
      <p className={`flex items-center gap-2 text-sm font-semibold ${headline.earned ? "text-primary" : "text-subtle"}`}>
        <Icon icon={headline.earned ? "solar:medal-star-bold" : "solar:info-circle-linear"} size={18} />
        {headline.text}
      </p>

      {goal && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-subtle">
            <span>{goal.just_achieved ? "Daily goal achieved! 🎉" : "Today's goal"}</span>
            <span className="font-semibold">{Math.min(goal.earned, goal.target)}/{goal.target} practice</span>
          </div>
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/30"
            role="progressbar" aria-label="Today's goal" aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={Math.min(goal.earned, goal.target)}
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{width: `${Math.min(100, (goal.earned / goal.target) * 100)}%`}} />
          </div>
        </div>
      )}

      {gamification.streak && gamification.streak.current_streak > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-subtle">
          <Icon icon="solar:bolt-bold" size={14} className="text-violet-600" />
          {gamification.streak.current_streak}-day streak{gamification.streak.extended ? " — extended today!" : ""}
        </p>
      )}

      {gamification.pending_rewards > 0 && (
        <Link href="/rewards" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          <Icon icon="solar:gift-bold" size={14} />
          {gamification.pending_rewards} {gamification.pending_rewards === 1 ? "reward" : "rewards"} waiting to claim
        </Link>
      )}
    </div>
  );
}
