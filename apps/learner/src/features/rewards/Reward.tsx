"use client";

import {Icon} from "@mcc/ui";
import {useClaimReward, usePendingRewards, useRewardsBalance} from "./hooks/useRewards";
import {ApiPendingReward} from "./services/rewards.service";

function PendingRewardRow({reward}: {reward: ApiPendingReward}) {
  const claimMutation = useClaimReward();

  return (
    <div className="relative rounded-2xl bg-gray-50 p-4 pr-5">
      <span className="absolute -top-1 right-3 rounded-b-md bg-violet-600 px-2 py-1 text-[10px] font-bold text-white capitalize">
        {reward.source}
      </span>

      <p className="text-xs text-gray-400">
        {new Date(reward.created_at).toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-800">
        {reward.title || `A ${reward.reward_type} reward from ${reward.source}`}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
          🪙 {reward.amount} {reward.reward_type}
        </span>

        <button
          type="button"
          disabled={claimMutation.isPending}
          onClick={() => claimMutation.mutate({id: reward.id, source: reward.source})}
          className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          {claimMutation.isPending ? "Claiming…" : "Claim"}
        </button>
      </div>
    </div>
  );
}

type RewardCardProps = {
  title: string;
  value: number | string;
  icon?: string;
};

export function RewardCard({title, value, icon}: RewardCardProps) {
  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-0 z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl">
        {icon && <Icon icon={icon} className="text-white" size={36} />}
      </div>

      <div className="ml-12 flex h-32 flex-1 items-center justify-between overflow-hidden rounded-[30px] bg-[#121B22] pl-16 pr-6 shadow-xl">
        <div className="absolute left-28 top-0 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

        <div className="relative ">
          <p className="text-xs font-medium uppercase text-white/60">{title}</p>

          <h2 className="font-semibold text-white">{value}</h2>
        </div>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const {data: balance} = useRewardsBalance();
  const {rewards: pendingRewards, isLoading} = usePendingRewards();

  return (
    <div className="">
      <div className="mb-4 flex justify-center">
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-700">
          <Icon icon="mdi:coins" size={16} />
          {(balance?.total_points ?? 0).toLocaleString()} points
        </span>
      </div>

      <div className="flex gap-3 max-md:flex-col">
        <RewardCard
          title="Silver Earned"
          value={(balance?.total_silver ?? 0).toLocaleString()}
          icon="solar:medal-star-bold"
        />
        <RewardCard
          title="Gems Earned"
          value={(balance?.total_gems ?? 0).toLocaleString()}
          icon="solar:cup-star-bold"
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">Rewards to claim</p>

        <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
          {pendingRewards.length} pending
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {isLoading && (
          <p className="col-span-2 text-center text-sm text-gray-400 py-8">Loading…</p>
        )}
        {!isLoading && pendingRewards.length === 0 && (
          <p className="col-span-2 text-center text-sm text-gray-400 py-8">
            No rewards waiting to be claimed.
          </p>
        )}
        {pendingRewards.map((reward) => (
          <PendingRewardRow key={reward.id} reward={reward} />
        ))}
      </div>
    </div>
  );
}
