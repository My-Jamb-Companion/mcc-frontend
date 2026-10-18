"use client";

import {Icon} from "@mcc/ui";
import {Coins} from "lucide-react";
import {
  useGoalsSummary,
  useMonthlyGoal,
  useRewardsStats,
  useWeeklyMilestones,
} from "./hooks/useRewards";

export default function GoalsProgress() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8 max-md:p-0 max-md:pt-5">
      {/* Hero */}
      <GoalsProgressCard />

      {/* Weekly */}
      <MonthlyGoalCardPreview />

      {/* Monthly Progress */}
      <GoalsSummary />
    </div>
  );
}

function GoalsProgressCard() {
  return (
    <div className="relative flex justify-center pt-6">
      {/* Bottom Card */}
      <div className="relative w-full rounded-[32px] border-2 border-muted/30 pt-14 pb-4.5">
        <h2 className="text-center font-semibold text-foreground pt-5">
          Goals &amp; Progress
        </h2>
      </div>

      {/* Floating Header */}
      <div className="absolute -top-10 z-10 w-[88%] max-w-[920px] overflow-hidden rounded-[34px] border border-white/10 bg-[#242426] py-7 flex items-center justify-center">
        <Icon icon="solar:cup-star-bold" size={48} className="text-white relative" />
      </div>
    </div>
  );
}

function GoalsSummary() {
  const {data: summary, isLoading, isError} = useGoalsSummary();
  const {data: milestonesData} = useWeeklyMilestones();
  const {data: stats} = useRewardsStats();

  // The backend's calendar is Lagos time (UTC+1), not the browser's or UTC.
  const todayIso = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
  const days: {day: string; date: string; status: "completed" | "failed" | "current" | "upcoming"}[] =
    (milestonesData?.milestones ?? []).map((m) => ({
      day: m.day,
      date: m.date.slice(-2),
      status:
        m.date === todayIso
          ? "current"
          : m.achieved === true
            ? "completed"
            : m.achieved === false
              ? "failed"
              : "upcoming",
    }));

  return (
    <section className="space-y-5">
      <h2 className="md:text-xl font-semibold text-foreground">
        Daily & Weekly Goals Summary
      </h2>

      <div className="rounded-[28px] border border-muted/40  p-8 shadow-lg shadow-gray-200/60 max-md:px-4 max-md:py-6">
        {/* Weekly Goal */}
        <div>
          <h3 className="md:text-xl font-semibold text-foreground">
            Weekly Goal
          </h3>

          <p className="text-sm text-subtle">
            {summary?.weekly.description ?? (isError ? "Couldn't load your goals." : "Loading your weekly goal…")}
          </p>

          {summary && (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40" role="progressbar" aria-valuemin={0} aria-valuemax={summary.weekly.target} aria-valuenow={summary.weekly.earned} aria-label="Weekly goal">
                <div className="h-full rounded-full bg-primary" style={{width: `${Math.min(100, summary.weekly.completion_percent)}%`}} />
              </div>
              <p className="mt-1 text-xs font-medium text-subtle">
                {summary.weekly.earned}/{summary.weekly.target} this week
                {summary.weekly.status === "achieved" && " · achieved"}
              </p>
            </div>
          )}

          {/* Calendar */}
          {days.length > 0 && <WeeklyGoalCalendar days={days} />}

          {/* Streak */}
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 text-sm max-md:text-xs font-semibold">
            <Icon
              icon="solar:bolt-bold"
              className="text-violet-600"
              size={18}
            />

            <span>{summary?.streak.current_streak ?? 0} days</span>

            <span>Your current streak</span>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="mt-10 flex items-center justify-between">
          <h3 className="md:text-lg font-bold text-foreground">Daily Goal</h3>

          <p className="text-lg">
            <span className="font-bold">{summary?.daily.earned ?? 0}</span>
            <span className="text-subtle text-xs">/{summary?.daily.target ?? 0} practice</span>
          </p>
        </div>

        {/* Achievement */}
        {summary?.daily.status === "achieved" && (
          <div className="mt-6 rounded-full bg-[#1d1d1f] py-4 text-center text-sm max-md:text-xs font-medium text-white shadow-lg">
            Congratulations, Daily Goal Achieved!
          </div>
        )}

        {/* Activity */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-muted/20">
          {isLoading && (
            <p className="px-3 py-6 text-center text-sm text-muted">Loading…</p>
          )}
          {!isLoading && isError && (
            <p className="px-3 py-6 text-center text-sm text-red-500">Couldn&apos;t load your activity. Please refresh.</p>
          )}
          {!isLoading && !isError && (stats?.rewards.length ?? 0) === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No activity yet.
            </p>
          )}
          {stats?.rewards.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-muted/20 px-3 py-2.5 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-[48px] items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Icon icon="solar:gift-bold" size={20} />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {activity.title}
                  </h4>

                  <p className="text-xs font-medium text-subtle">
                    {new Date(activity.claimed_at).toLocaleString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-subtle">
                <Coins size={14} className="text-yellow-400" />
                <span className="font-semibold">{activity.amount}</span>
                {activity.reward_type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeeklyGoalCalendar({
  days,
}: {
  days: {day: string; date: string; status: "completed" | "failed" | "current" | "upcoming"}[];
}) {
  return (
    <div className="mt-6 overflow-x-auto">
      <div className="flex w-max items-center gap-2">
        {days.map((day) => (
          <div
            key={day.date}
            className={`flex h-10 shrink-0 rounded-xl transition-all ${
              day.status === "completed"
                ? "bg-primary"
                : day.status === "current"
                  ? "bg-primary/10"
                  : "bg-background border-transparent"
            }`}
          >
            <div
              className={`flex w-8 items-center justify-center text-[11px] font-medium ${
                day.status === "completed"
                  ? "text-white"
                  : day.status === "current"
                    ? "text-foreground"
                    : "text-subtle"
              }`}
            >
              {day.day}
            </div>

            <div
              className={`flex w-10 items-center justify-center text-sm font-bold m-1 rounded-lg ${
                day.status === "completed"
                  ? "bg-background"
                  : day.status === "current"
                    ? "bg-violet-600 text-white"
                    : "bg-background"
              }`}
            >
              {day.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyGoalCardPreview() {
  const {data: monthly, isError} = useMonthlyGoal();

  const current = monthly?.earned ?? 0;
  const target = monthly?.target ?? 0;
  const percent = target > 0 ? Math.round((current / target) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h3 className="md:text-lg font-bold text-foreground">Goal Progress</h3>
      </div>

      <div className="mt-3 rounded-2xl border border-muted/30 shadow-sm p-6">
        <div className="flex items-center justify-between gap-6">
          <h4 className="md:text-xl font-bold text-foreground">
            {monthly?.month ?? "Monthly Goal"}
          </h4>
          <div className="h-1.5 w-48 shrink-0 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{width: `${Math.min(100, percent)}%`}}
            />
          </div>
        </div>

        <p className="mt-1 text-sm text-subtle">
          {monthly?.description ?? (isError ? "Couldn't load your monthly goal." : "")}
        </p>

        <div className="mt-5 flex items-end justify-between">
          <p className="text-2xl font-bold text-foreground">
            {current.toLocaleString()}
            <span className="text-sm font-medium text-subtle">
              /{target ? target.toLocaleString() : "—"} points
            </span>
          </p>
          <p className="text-sm font-bold text-foreground">{percent}%</p>
        </div>
      </div>
    </div>
  );
}
