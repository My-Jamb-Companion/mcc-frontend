"use client";
import {useState} from "react";

import Leaderboard from "./LeaderBoard";
import GoalsProgressPage from "./Goals";
import RewardsPage from "./Reward";
import {Icon} from "@mcc/ui";
import BannerCarousel from "../components/BannerCarousel";

export default function Rewards() {
  const [tab, setTab] = useState("goals");

  return (
    <section className="max-md:px-4 pb-20 pt-10">
      <BannerCarousel />
      <div className="w-full mx-auto max-w-[900px] ">
        <TopNav active={tab} onChange={setTab} />
        {tab === "goals" && <GoalsProgressPage />}
        {tab === "leaderboard" && <Leaderboard />}
        {tab === "rewards" && <RewardsPage />}
      </div>
    </section>
  );
}

function TopNav({
  active,
  onChange,
}: {
  active: string;
  onChange: (key: string) => void;
}) {
  const items = [
    {key: "goals", label: "Goals & Progress", icon: "ri:progress-5-line"},
    {key: "leaderboard", label: "Leaderboard", icon: "ri:bard-fill"},
    {key: "rewards", label: "Rewards", icon: "ri:trophy-fill"},
  ];
  return (
    <div className="flex justify-center gap-6 py-4 mb-7 max-md:overflow-x-auto max-md:pl-30">
      {items.map(({key, label, icon}) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs md:text-sm font-medium transition-colors text-nowrap ${
              isActive
                ? "border border-muted/30"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon icon={icon} size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
