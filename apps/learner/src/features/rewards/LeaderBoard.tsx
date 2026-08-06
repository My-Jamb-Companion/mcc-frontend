import {ChevronDown, Coins} from "lucide-react";

const rankings = [
  {
    id: 2,
    name: "Micheal Carrick",
    points: 800,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Micheal",
  },
  {
    id: 3,
    name: "Bruno Fernandez",
    points: 800,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bruno",
  },
  {
    id: 4,
    name: "Mac aliister",
    points: 800,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mac",
  },
  {
    id: 5,
    name: "Godsent Emma",
    points: 800,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emma",
  },
];

export default function Leaderboard() {
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
              src="https://api.dicebear.com/7.x/adventurer/svg?seed=Bright"
              className="h-full w-full object-cover"
              alt=""
            />
          </div>
        </div>

        <div className="relative flex w-full items-center justify-between h-[95px] md:h-[112px] bg-[#121A22] px-4 pr-7 py-5  rounded-r-3xl">
          <div>
            <p className="text-xs uppercase  text-gray-400">1st Position</p>

            <h1 className="font-semibold text-white">Bright Mba</h1>
          </div>

          <div className="flex items-center gap-2 text-white text-xs">
            <Coins size={14} className="text-yellow-400" />
            <span className="font-semibold">899</span>
            <span className="text-gray-400">points</span>
          </div>

          <div className="absolute top-0 left-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="102"
              height="32"
              viewBox="0 0 102 32"
              fill="none"
            >
              <g filter="url(#filter0_f_4011_41544)">
                <ellipse
                  cx="49.5"
                  rx="36.5"
                  ry="16"
                  fill="white"
                  fill-opacity="0.3"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f_4011_41544"
                  x="-3"
                  y="-32"
                  width="105"
                  height="64"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="8"
                    result="effect1_foregroundBlur_4011_41544"
                  />
                </filter>
              </defs>
            </svg>
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
        {rankings.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-full border border-gray-200 bg-white p-2 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt=""
                className="h-12 w-12 rounded-full bg-indigo-500"
              />

              <span className="md:text-lg font-semibold text-gray-800">
                {user.name}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold">
                <Coins size={14} className="text-yellow-400" />
                <span>{user.points}</span>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 text-lg font-bold">
                {user.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
