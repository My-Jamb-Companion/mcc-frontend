"use client";

import {useMemo, useState} from "react";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
  Icon,
} from "@mcc/ui";

export interface MonthlyFlowDatum {
  month: string;
  income: number;
  payout: number;
}

interface MonthlyFlowChartProps {
  data: MonthlyFlowDatum[];
  currencySymbol?: string;
  className?: string;
}

const formatValue = (value: number, currencySymbol: string) => {
  const millions = value / 1_000_000;
  return `${currencySymbol}${millions.toFixed(1)}m`;
};

function CustomTooltip({
  active,
  payload,
  label,
  currencySymbol,
}: TooltipProps<number, string> & {currencySymbol: string}) {
  if (!active || !payload?.length) return null;

  const income = payload.find((entry) => entry.dataKey === "income");
  const payouts = payload.find((entry) => entry.dataKey === "payout");
  if (!income || !payouts) return null;

  return (
    <div className="flex flex-col gap-1 rounded-xl bg-neutral-900 px-4 py-3 text-white shadow-lg">
      <div className="flex items-center gap-2 text-sm text-neutral-200">
        <Icon
          icon="mdi:checkbox-blank-circle"
          size={10}
          className="text-indigo-500"
        />
        <span>Income</span>
        <Icon
          icon="mdi:checkbox-blank-circle"
          size={10}
          className="text-[#eeecfb]"
        />
        <span>Payouts</span>
      </div>
      <span className="text-base font-semibold text-indigo-500">
        {formatValue(income.value as number, currencySymbol)}
      </span>
      <span className="text-base font-semibold">
        {formatValue(payouts.value as number, currencySymbol)}
      </span>
    </div>
  );
}

export function IncomeandPayoutschart({
  data,
  currencySymbol = "₦",
  className,
}: MonthlyFlowChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const average = useMemo(
    () => data.reduce((sum, d) => sum + d.income, 0) / data.length,
    [data],
  );

  return (
    <div
      className={`rounded-2xl border border-neutral-100 bg-white px-4 py-6 ${className ?? ""}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Income and Payouts
        </h3>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Icon
              icon="mdi:checkbox-blank-circle"
              size={10}
              className="text-indigo-600"
            />
            Income
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Icon
              icon="mdi:checkbox-blank-circle"
              size={10}
              className="text-indigo-100"
            />
            Payout
          </div>

          <button className="flex items-center gap-1 text-sm font-medium text-neutral-500">
            Monthly
            <Icon icon="mdi:chevron-down" size={16} />
          </button>
        </div>
      </div>

      <div className="h-100 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barGap={-68}
            margin={{top: 20, right: 4, bottom: 0, left: 4}}
            onMouseMove={(state) => {
              if (
                state.isTooltipActive &&
                state.activeTooltipIndex !== undefined
              ) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{fill: "#a3a3a3", fontSize: 13}}
              dy={10}
            />
            <YAxis hide domain={[0, "dataMax"]} />

            <ReferenceLine
              y={average}
              stroke="#d4d4d8"
              strokeDasharray="4 4"
              strokeWidth={1}
            />

            <Tooltip
              cursor={false}
              content={<CustomTooltip currencySymbol={currencySymbol} />}
            />

            <Bar
              dataKey="payout"
              fill="#eeecfb"
              radius={[8, 8, 8, 8]}
              barSize={68}
              isAnimationActive={false}
            />

            <Bar
              dataKey="income"
              radius={[8, 8, 8, 8]}
              barSize={68}
              isAnimationActive={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === activeIndex ? "#4c3fe0" : "#5548e8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default IncomeandPayoutschart;
