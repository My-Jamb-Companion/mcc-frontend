"use client";

import {useMemo} from "react";
import {Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "@mcc/ui";
import {useCallSummary} from "../hooks/useLiveSessions";
import {chartRows} from "../helper/sessionForm";

const naira = new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0});

/** Calls joined per day over the chosen window, with the revenue they brought in on hover. */
export default function CallSummaryChart({days}: {days: number}) {
  const {data, isLoading, isError} = useCallSummary(days);
  const rows = useMemo(() => chartRows(data ?? [], days), [data, days]);
  const total = rows.reduce((sum, r) => sum + r.calls, 0);

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-neutral-900">Calls per day</h2>
        <p className="text-xs text-neutral-500">{total.toLocaleString()} calls in this period</p>
      </div>
      {isLoading ? (
        <div className="h-52 animate-pulse rounded-xl bg-neutral-100" />
      ) : isError ? (
        <p className="text-sm text-red-600">The call chart couldn&apos;t be loaded.</p>
      ) : total === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">No calls were joined in this period.</p>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{top: 8, right: 4, bottom: 0, left: 4}}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: "#a3a3a3", fontSize: 12}} interval="preserveStartEnd" minTickGap={24} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                cursor={{fill: "#f5f3ff"}}
                content={({active, payload}) => {
                  const row = active ? payload?.[0]?.payload : null;
                  if (!row) return null;
                  return (
                    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow">
                      <p className="font-semibold text-neutral-900">{row.day}</p>
                      <p className="text-neutral-700">{row.calls} {row.calls === 1 ? "call" : "calls"}</p>
                      <p className="text-neutral-700">₦{naira.format(row.revenue)} revenue</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="calls" fill="#6B26FF" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
