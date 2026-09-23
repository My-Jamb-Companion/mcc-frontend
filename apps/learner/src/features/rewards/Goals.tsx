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
        <h2 className="text-center font-semibold text-gray-900 pt-5">
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
  const {data: summary, isLoading} = useGoalsSummary();
  const {data: milestonesData} = useWeeklyMilestones();
  const {data: stats} = useRewardsStats();

  const todayIso = new Date().toISOString().slice(0, 10);
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
      <h2 className="md:text-xl font-semibold text-gray-900">
        Daily & Weekly Goals Summary
      </h2>

      <div className="rounded-[28px] border border-muted/40  p-8 shadow-lg shadow-gray-200/60 max-md:px-4 max-md:py-6">
        {/* Weekly Goal */}
        <div>
          <h3 className="md:text-xl font-semibold text-gray-900">
            Weekly Goal
          </h3>

          <p className="text-sm text-gray-500">
            {summary?.weekly.description ?? "Loading your weekly goal…"}
          </p>

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
          <h3 className="md:text-lg font-bold text-gray-900">Daily Goal</h3>

          <p className="text-lg">
            <span className="font-bold">{summary?.daily.earned ?? 0}</span>
            <span className="text-gray-500 text-xs">/{summary?.daily.target ?? 0} practice</span>
          </p>
        </div>

        {/* Achievement */}
        {summary?.daily.status === "completed" && (
          <div className="mt-6 rounded-full bg-[#1d1d1f] py-4 text-center text-sm max-md:text-xs font-medium text-white shadow-lg">
            Congratulations, Daily Goal Achieved!
          </div>
        )}

        {/* Activity */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200">
          {isLoading && (
            <p className="px-3 py-6 text-center text-sm text-gray-400">Loading…</p>
          )}
          {!isLoading && (stats?.rewards.length ?? 0) === 0 && (
            <p className="px-3 py-6 text-center text-sm text-gray-400">
              No activity yet.
            </p>
          )}
          {stats?.rewards.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-[48px] rounded-xl bg-violet-600" />

                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {activity.title}
                  </h4>

                  <p className="text-xs font-medium text-gray-500">
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

              <div className="flex items-center gap-1 text-xs text-gray-600">
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
          <button
            key={day.date}
            className={`flex h-10 shrink-0 rounded-xl transition-all ${
              day.status === "completed"
                ? "bg-primary"
                : day.status === "current"
                  ? "bg-primary/10"
                  : "bg-white border-transparent"
            }`}
          >
            <div
              className={`flex w-8 items-center justify-center text-[11px] font-medium ${
                day.status === "completed"
                  ? "text-white"
                  : day.status === "current"
                    ? "text-black"
                    : "text-gray-500"
              }`}
            >
              {day.day}
            </div>

            <div
              className={`flex w-10 items-center justify-center text-sm font-bold m-1 rounded-lg ${
                day.status === "completed"
                  ? "bg-white"
                  : day.status === "current"
                    ? "bg-violet-600 text-white"
                    : "bg-white"
              }`}
            >
              {day.date}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MonthlyGoalCardPreview() {
  const {data: monthly} = useMonthlyGoal();

  const current = monthly?.earned ?? 0;
  const target = monthly?.target ?? 1;
  const percent = Math.round((current / target) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h3 className="md:text-lg font-bold text-gray-900">Goal Progress</h3>
      </div>

      <div className="mt-3 rounded-2xl border border-muted/30 shadow-sm p-6">
        <div className="flex items-center justify-between gap-6">
          <h4 className="md:text-xl font-bold text-gray-900">
            {monthly?.month ?? "Monthly Goal"}
          </h4>
          <div className="h-1.5 w-48 shrink-0 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{width: `${Math.min(100, percent)}%`}}
            />
          </div>
        </div>

        <p className="mt-1 text-sm text-subtle">{monthly?.description}</p>

        <div className="mt-5 flex items-end justify-between">
          <p className="text-2xl font-bold text-gray-900">
            {current.toLocaleString()}
            <span className="text-sm font-medium text-subtle">
              /{target.toLocaleString()} points
            </span>
          </p>
          <p className="text-sm font-bold text-gray-700">{percent}%</p>
        </div>
      </div>
    </div>
  );
}
