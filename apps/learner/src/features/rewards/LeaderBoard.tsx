import {ChevronDown, Coins} from "lucide-react";
import {useLeaderboard, useMyLeaderboardStanding} from "./hooks/useRewards";
import {useProfile} from "../account/hooks/useProfile";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function Leaderboard() {
  const {entries, isLoading} = useLeaderboard();
  const {data: mine} = useMyLeaderboardStanding();
  const {data: profile} = useProfile();

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

      {/* Rankings Header */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-semibold">All rankings</h3>

        <div className="flex gap-6">
          <button className="flex items-center gap-2 text-gray-500">
            Location
            <ChevronDown size={16} />
          </button>

          <button className="flex items-center gap-2 text-gray-500">
            Program
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-8 space-y-5">
        {isLoading && (
          <p className="text-sm text-gray-400 text-center py-8">Loading leaderboard…</p>
        )}
        {!isLoading && entries.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No leaderboard activity yet.</p>
        )}
        {entries.map((user) => (
          <div
            key={`${user.rank}-${user.user}`}
            className="flex items-center justify-between rounded-full border border-gray-200 bg-white p-2 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <img
                src={user.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.user)}`}
                alt=""
                className="h-12 w-12 rounded-full bg-indigo-500"
              />

              <span className="md:text-lg font-semibold text-gray-800">
                {user.user}
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
