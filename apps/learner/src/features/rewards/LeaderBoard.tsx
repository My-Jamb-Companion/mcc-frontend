"use client";

import {ChevronDown, Coins, Trophy} from "lucide-react";
import {useState} from "react";
import {DEFAULT_LEADERBOARD_FILTERS, LeaderboardFilters} from "./services/rewards.service";
import {useEnrolledPrograms} from "@/src/features/exams/hooks/useExams";
import {
  useGamificationRules,
  useLeaderboard,
  useLeaderboardStatus,
  useMyLeaderboardStanding,
} from "./hooks/useRewards";
import {useProfile} from "../account/hooks/useProfile";

// What the rules endpoint reports, in words. A key the app doesn't know yet is shown by its own name.
const RULE_LABEL: Record<string, string> = {
  quiz_completion: "Pass a quiz or test (50% or more)",
  course_completion: "Finish a course",
  exam_program_completion: "Finish an exam program",
  progress_step: "Move further through a course or program",
  daily_quiz_points_cap: "Most quiz points you can earn in a day",
};

const PERIODS: {value: LeaderboardFilters["period"]; label: string}[] = [
  {value: "all", label: "All time"},
  {value: "week", label: "This week"},
];

const SCOPES: {value: LeaderboardFilters["scope"]; label: string}[] = [
  {value: "everyone", label: "Everyone"},
  {value: "country", label: "My country"},
  {value: "state", label: "My state"},
];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function Leaderboard() {
  const [filters, setFilters] = useState<LeaderboardFilters>(DEFAULT_LEADERBOARD_FILTERS);
  const {entries, isLoading, isError} = useLeaderboard(filters);
  const {data: mine} = useMyLeaderboardStanding(filters);
  const {data: programs} = useEnrolledPrograms();
  const {data: profile} = useProfile();
  const {data: status} = useLeaderboardStatus();
  const {data: rules} = useGamificationRules();
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl  p-8 max-md:p-0">
      {/* Heading */}
      <h2 className="font-semibold text-gray-800">My Ranking.</h2>

      <div className="mt-4 h-px bg-gray-200 mb-6" />

      {/* Top Card */}
      <div className="flex items-center">
        {/* Avatar */}
        <div className="">
          <div className="flex w-[136px] h-[136px] md:h-40 md:w-40 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <img
              src={profile?.profile_photo_url || "https://api.dicebear.com/7.x/adventurer/svg?seed=me"}
              className="h-full w-full object-cover"
              alt=""
            />
          </div>
        </div>

        <div className="relative flex w-full items-center justify-between h-[95px] md:h-[112px] bg-[#121A22] px-4 pr-7 py-5  rounded-r-3xl">
          <div>
            <p className="text-xs uppercase  text-gray-400">
              {mine && mine.rank > 0 ? `${ordinal(mine.rank)} Position` : "Unranked"}
            </p>

            <h1 className="font-semibold text-white">
              {profile?.full_name || profile?.username || "You"}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-white text-xs">
            <Coins size={14} className="text-yellow-400" />
            <span className="font-semibold">{mine?.total_score ?? 0}</span>
            <span className="text-gray-400">points</span>
          </div>
        </div>
      </div>

      {status && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <Trophy size={20} className="shrink-0 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-gray-800">{status.status_message}</p>
            {status.can_claim ? (
              <p className="text-xs text-gray-500">
                Your weekly prize of {status.prize_gems} gems is ready: claim it on the Rewards tab.
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Finish the week in the top {Math.round(100 - (status.min_percentile ?? 60))}% to win {status.prize_gems} gems.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Rankings Header */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-semibold">All rankings</h3>

        <button
          onClick={() => setRulesOpen((v) => !v)}
          aria-expanded={rulesOpen}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
        >
          How points work
          <ChevronDown size={16} className={rulesOpen ? "rotate-180" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-gray-200 p-0.5" role="group" aria-label="Time period">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={filters.period === p.value}
              onClick={() => setFilters((f) => ({...f, period: p.value}))}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filters.period === p.value ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Location"
          value={filters.scope}
          onChange={(e) => setFilters((f) => ({...f, scope: e.target.value as LeaderboardFilters["scope"]}))}
          className="rounded-full border border-gray-200 bg-transparent px-3 py-1.5 text-xs font-medium text-gray-700"
        >
          {SCOPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {(programs?.length ?? 0) > 0 && (
          <select
            aria-label="Program"
            value={filters.programId ?? ""}
            onChange={(e) => setFilters((f) => ({...f, programId: e.target.value || undefined}))}
            className="max-w-[220px] rounded-full border border-gray-200 bg-transparent px-3 py-1.5 text-xs font-medium text-gray-700"
          >
            <option value="">All programs</option>
            {programs?.map((p) => (
              <option key={p.program_id} value={p.program_id}>
                {[p.exam_name, p.subject_name].filter(Boolean).join(" — ") || "Exam program"}
              </option>
            ))}
          </select>
        )}
      </div>

      {rulesOpen && rules && (
        <ul className="mt-4 space-y-2 rounded-2xl border border-gray-200 bg-white p-4">
          {Object.entries(rules).map(([key, points]) => (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{RULE_LABEL[key] ?? key.replace(/_/g, " ")}</span>
              <span className="flex items-center gap-1 font-semibold text-gray-800">
                <Coins size={14} className="text-yellow-400" />
                {points}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* List */}
      <div className="mt-8 space-y-5">
        {isLoading && (
          <p className="text-sm text-gray-400 text-center py-8">Loading leaderboard…</p>
        )}
        {isError && (
          <p className="text-sm text-red-500 text-center py-8">Couldn&apos;t load the leaderboard. Please try again.</p>
        )}
        {!isLoading && !isError && entries.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            {filters.scope === "everyone"
              ? "No leaderboard activity yet."
              : `Nobody to show for this view yet. Check your ${filters.scope} is set in your account.`}
          </p>
        )}
        {entries.map((user) => (
          <div
            key={`${user.rank}-${user.user}`}
            aria-current={user.is_me ? "true" : undefined}
            className={`flex items-center justify-between rounded-full border p-2 shadow-sm transition hover:shadow-md ${
              user.is_me ? "border-violet-300 bg-violet-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <img
                src={user.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.user)}`}
                alt=""
                className="h-12 w-12 rounded-full bg-indigo-500"
              />

              <span className="md:text-lg font-semibold text-gray-800">
                {user.user}
                {user.is_me && <span className="ml-2 rounded-full bg-violet-600 px-2 py-0.5 align-middle text-[10px] font-semibold text-white">You</span>}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                <Coins size={14} className="text-yellow-400" />
                <span>{user.score}</span>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 text-lg font-bold">
                {user.rank}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
