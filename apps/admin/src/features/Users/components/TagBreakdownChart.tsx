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

interface TagBreakdownChartProps {
  title: string;
  items: {key: string; count: number}[];
  labelFor: (key: string) => string;
  totalRespondents: number;
  totalUsers: number;
  isLoading: boolean;
  emptyMessage: string;
}

/** A horizontal bar chart of counts-per-tag, shared between
 * ReferralSourceDashboard and PurposeDashboard -- both onboarding
 * questions store a flat comma-joined multi-pick answer and get counted
 * the same way server-side, so the chart only differs in its data/labels. */
export default function TagBreakdownChart({
  title,
  items,
  labelFor,
  totalRespondents,
  totalUsers,
  isLoading,
  emptyMessage,
}: TagBreakdownChartProps) {
  const data = items
    .map((i) => ({key: i.key, label: labelFor(i.key), count: i.count}))
    .sort((a, b) => b.count - a.count);

  const responseRate = totalUsers > 0 ? Math.round((totalRespondents / totalUsers) * 100) : 0;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
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
          <p className="text-sm text-slate-400">{emptyMessage}</p>
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
                  <Cell key={entry.key} fill="#5548e8" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
