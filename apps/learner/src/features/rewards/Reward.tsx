import {Icon} from "@mcc/ui";

export interface RewardItem {
  rank: string;
  ribbon: string;
  text: string;
  badges: number;
  points: number;
  highlight?: string;
  subtle?: boolean;
}

interface RewardRowProps {
  item: RewardItem;
}

function RewardRow({item}: RewardRowProps) {
  return (
    <div className="relative rounded-2xl bg-gray-50 p-4 pr-5">
      <span
        className={`absolute -top-1 right-3 rounded-b-md px-2 py-1 text-[10px] font-bold text-white ${item.ribbon}`}
        style={{
          clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)",
        }}
      >
        {item.rank}
      </span>

      <p className="text-xs text-gray-400">05 Apr, 2026, 8:30 PM</p>

      <p className="mt-1 text-sm font-medium text-gray-800">
        {item.highlight ? (
          <>
            {item.text.split(item.highlight)[0]}
            <span className="font-bold text-rose-500">{item.highlight}</span>
          </>
        ) : (
          item.text
        )}
      </p>

      <div className="mt-2 flex gap-4 text-xs font-semibold text-gray-600">
        <span className="flex items-center gap-1">
          💎
          {item.badges}
        </span>

        <span className="flex items-center gap-1">
          🪙
          {item.points}
        </span>
      </div>
    </div>
  );
}

type RewardCardProps = {
  title: string;
  value: number | string;
  icon?: string;
  image?: string;
};

export function RewardCard({title, value, icon, image}: RewardCardProps) {
  return (
    <div className="relative flex items-center w-full">
      {/* Floating Image */}
      <div className="absolute left-0 z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          // <Icon icon="solar:medal-star-bold" className="text-white" size={42} />
          <></>
        )}
      </div>

      {/* Card */}
      <div className="ml-12 flex h-32 flex-1 items-center justify-between overflow-hidden rounded-[30px] bg-[#121B22] pl-16 pr-6 shadow-xl">
        {/* Top Glow */}
        <div className="absolute left-28 top-0 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

        <div className="relative ">
          <p className="text-xs font-medium uppercase text-white/60">{title}</p>

          <h2 className="font-semibold text-white">{value}</h2>
        </div>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 transition hover:bg-violet-700">
          <Icon icon={String(icon)} className="text-white" size={20} />
        </button>
      </div>
    </div>
  );
}
export default function RewardsPage() {
  return (
    <div className="">
      <div className="mb-4 flex justify-center">
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-700">
          <Icon icon="mdi:coins" size={16} />
          8,299 points
        </span>
      </div>

      <div className="flex gap-3 flex-col">
        <RewardCard
          title="Silver Earned"
          value="23,879"
          icon="solar:refresh-bold"
          // image="https://images.unsplash.com/photo-1621113481786-4e176d4f5f47?auto=format&fit=crop&w=64&h=64&q=80"
        />
        <RewardCard
          title="Diamonds Earned"
          value="23,879"
          icon="line-md:plus"
          // image="https://images.unsplash.com/photo-1621113481786-4e176d4f5f47?auto=format&fit=crop&w=64&h=64&q=80"
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">Your Rewards</p>

        <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
          All time
          <Icon icon="solar:alt-arrow-down-linear" size={14} />
          <span className="ml-2 flex items-center gap-1 text-gray-600">
            <Icon icon="mdi:coins" size={14} className="text-amber-500" />
            23,456 points
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {REWARDS.map((reward, idx) => (
          <RewardRow key={`${reward.rank}-${idx}`} item={reward} />
        ))}
      </div>
    </div>
  );
}

const REWARDS: RewardItem[] = [
  {
    rank: "#1",
    ribbon: "bg-violet-600",
    text: "You finished top 3 this week and you have earned some reward.",
    badges: 290,
    points: 500,
  },
  {
    rank: "#2",
    ribbon: "bg-amber-400",
    text: "You finished top 3 this week and you have earned some reward.",
    badges: 290,
    points: 450,
  },
  {
    rank: "#21",
    ribbon: "bg-violet-600",
    text: "You hit your monthly goal for JAN and earned some reward.",
    badges: 290,
    points: 300,
    subtle: true,
  },
  {
    rank: "#12",
    ribbon: "bg-slate-500",
    text: "You hit your monthly goal for FEB and earned some reward.",
    badges: 290,
    points: 300,
    subtle: true,
  },
  {
    rank: "#3",
    ribbon: "bg-teal-500",
    text: "You finished top 3 this week and you have earned some reward.",
    badges: 290,
    points: 400,
  },
  {
    rank: "#2",
    ribbon: "bg-amber-400",
    text: "You finished top 3 this week and you have earned some reward.",
    badges: 290,
    points: 450,
  },
  {
    rank: "#21",
    ribbon: "bg-slate-500",
    text: "Congratulations! you have achieved a 10 DAYS practice Streak!",
    badges: 290,
    points: 200,
    highlight: "10 DAYS practice Streak!",
    subtle: true,
  },
  {
    rank: "#12",
    ribbon: "bg-slate-500",
    text: "Congratulations! you have achieved a 100 DAYS practice Streak!",
    badges: 290,
    points: 1000,
    highlight: "100 DAYS practice Streak!",
    subtle: true,
  },
  {
    rank: "#21",
    ribbon: "bg-slate-500",
    text: "Congratulations! you have achieved a 10 DAYS study Streak!",
    badges: 290,
    points: 200,
    highlight: "10 DAYS study Streak!",
    subtle: true,
  },
  {
    rank: "#12",
    ribbon: "bg-slate-500",
    text: "Congratulations! you have achieved a 100 DAYS study Streak!",
    badges: 290,
    points: 1000,
    highlight: "100 DAYS study Streak!",
    subtle: true,
  },
];
