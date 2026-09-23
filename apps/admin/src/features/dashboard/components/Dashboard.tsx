"use client";

import {Icon} from "@mcc/ui";
import {usePlatformOverview, useUserGrowth, useLeaderboard} from "../hooks/useDashboard";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
        <Icon icon={icon} size={16} />
        <span>{label}</span>
      </div>
      <span className="text-4xl font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function UserGrowthChart() {
  const {data: growth = [], isLoading} = useUserGrowth();
  const max = Math.max(1, ...growth.map((p) => p.new_users));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">
        New users (last 30 days)
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Daily sign-ups across the platform
      </p>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-gray-400">Loading…</p>
      ) : growth.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          No new users in this window yet.
        </p>
      ) : (
        <div className="flex items-end gap-1 h-40">
          {growth.map((point) => (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              <div
                className="w-full rounded-t-sm bg-violet-500/80 group-hover:bg-violet-600 transition-colors"
                style={{height: `${(point.new_users / max) * 100}%`, minHeight: point.new_users > 0 ? 4 : 0}}
              />
              <div className="absolute -top-6 hidden group-hover:block text-[10px] text-gray-600 whitespace-nowrap">
                {point.date}: {point.new_users}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LeaderboardPreview() {
  const {data: leaderboard = [], isLoading} = useLeaderboard();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Top students</h2>
      <p className="text-sm text-gray-400 mb-6">By total points earned</p>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-gray-400">Loading…</p>
      ) : leaderboard.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No leaderboard activity yet.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {leaderboard.slice(0, 5).map((entry) => (
            <div
              key={entry.leaderboard_position}
              className="flex items-center justify-between py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-sm font-semibold text-gray-400">
                  #{entry.leaderboard_position}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {entry.full_name}
                </span>
              </div>
              <span className="text-sm text-gray-600">{entry.total_points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const {data: overview, isLoading: overviewLoading} = usePlatformOverview();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon="mdi:account-group-outline"
          label="Total users"
          value={overviewLoading ? "—" : String(overview?.total_users ?? 0)}
        />
        <StatCard
          icon="mdi:calendar-multiple"
          label="Total sessions"
          value={overviewLoading ? "—" : String(overview?.total_sessions ?? 0)}
        />
        <StatCard
          icon="mdi:chart-line"
          label="Average performance"
          value={
            overviewLoading
              ? "—"
              : `${(overview?.average_performance ?? 0).toFixed(1)}%`
          }
        />
      </div>

      <UserGrowthChart />
      <LeaderboardPreview />
    </section>
  );
}
