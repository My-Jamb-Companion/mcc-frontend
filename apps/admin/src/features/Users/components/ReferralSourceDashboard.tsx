"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
  Icon,
} from "@mcc/ui";
import {useReferralSources} from "../hooks/useUsers";

// Matches apps/learner/src/features/onboarding/constants/formSteps.tsx's
// step2 options exactly -- the raw values stored in
// users_profile.referral_source -- just with friendlier display labels.
// "infuencer" is a pre-existing typo in that stored value, not introduced
// here; fixing the display label doesn't touch the underlying data.
const SOURCE_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  "google search": "Google Search",
  chatgpt: "ChatGPT",
  advertisement: "Advertisement",
  infuencer: "Influencer or Creator",
  friend: "Friend or Colleague",
  other: "Other",
};

function labelFor(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

function CustomTooltip({active, payload}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl bg-neutral-900 px-4 py-2.5 text-white shadow-lg">
      <p className="text-sm text-neutral-200">{entry.payload.label}</p>
      <p className="text-base font-semibold">{entry.value} users</p>
    </div>
  );
}

export default function ReferralSourceDashboard() {
  const {sources, totalRespondents, totalUsers, isLoading} = useReferralSources();

  const data = sources
    .map((s) => ({source: s.source, label: labelFor(s.source), count: s.count}))
    .sort((a, b) => b.count - a.count);

  const responseRate = totalUsers > 0 ? Math.round((totalRespondents / totalUsers) * 100) : 0;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">
          How did you hear about us?
        </h3>
        {!isLoading && (
          <p className="text-sm text-neutral-500">
            {totalRespondents} of {totalUsers} users answered ({responseRate}%)
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading…</p>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Icon icon="ri:bar-chart-2-line" size={28} className="text-neutral-300" />
          <p className="text-sm text-slate-400">
            No onboarding answers yet -- this fills in as students complete onboarding.
          </p>
        </div>
      ) : (
        <div className="w-full" style={{height: Math.max(data.length * 44, 200)}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{top: 4, right: 24, bottom: 4, left: 4}}
            >
              <CartesianGrid horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" allowDecimals={false} tick={{fill: "#a3a3a3", fontSize: 12}} />
              <YAxis
                type="category"
                dataKey="label"
                width={140}
                axisLine={false}
                tickLine={false}
                tick={{fill: "#404040", fontSize: 13}}
              />
              <Tooltip cursor={{fill: "#f8fafc"}} content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20} isAnimationActive={false}>
                {data.map((entry) => (
                  <Cell key={entry.source} fill="#5548e8" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
