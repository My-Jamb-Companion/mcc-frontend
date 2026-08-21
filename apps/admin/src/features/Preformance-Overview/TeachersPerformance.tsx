"use client";
import React from "react";
import {Info, User, Users, ArrowUpRight, ArrowDownRight} from "lucide-react";
import {FormInputs} from "@mcc/features";

interface MetricBadgeProps {
  change: string;
  isPositive: boolean;
  timeframe: string;
}

const TrendBadge: React.FC<MetricBadgeProps> = ({
  change,
  isPositive,
  timeframe,
}) => {
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-semibold ${
          isPositive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-rose-50 text-rose-500"
        }`}
      >
        <Icon className="h-3 w-3 stroke-[2.5]" />
        {change}
      </span>
      <span className="text-[11px] text-gray-400">vs {timeframe}</span>
    </div>
  );
};

export const TeacherPerformanceDashboard: React.FC = () => {
  const timeframes = [
    {label: "last 7 days", value: "last 7 days"},
    {label: "last 30 days", value: "last 30 days"},
    {label: "last 90 days", value: "last 90 days"},
  ];

  const [selectedTimeframe, setSelectedTimeframe] =
    React.useState<string>("last 7 days");
  return (
    <div className="w-full ">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="font-mono text-base font-semibold text-gray-800">
          Teacher Performance
        </h2>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
              <span>Total No of Admins</span>
              <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer" />
            </div>
            <span className="mt-1 text-2xl font-bold text-gray-900">240</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
              <span>No of connections</span>
              <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer" />
            </div>
            <span className="mt-1 text-2xl font-bold text-gray-900">3.2k</span>
          </div>
        </div>

        <div className="relative">
          <FormInputs
            type="select"
            value={selectedTimeframe}
            onChange={(value) => setSelectedTimeframe(value)}
            options={timeframes}
            selectRadius="full"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
        <div className="p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
            <div className="flex flex-col items-center justify-center text-center md:col-span-5">
              <span className="font-mono text-sm tracking-wide text-gray-400">
                Teachers & Admin.
              </span>
              <span className="mt-3 text-6xl font-bold tracking-tight text-gray-900">
                120
              </span>
            </div>

            <div className="relative grid grid-cols-1 gap-y-8 md:col-span-7 md:grid-cols-2 md:gap-x-12">
              <div className="flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>Teachers</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900">90</span>
                  <TrendBadge
                    change="34.9%"
                    isPositive={false}
                    timeframe="prev month"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>Other admins</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900">30</span>
                  <TrendBadge
                    change="24.2%"
                    isPositive={true}
                    timeframe="prev month"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/80 py-3.5 text-center border-t border-gray-100">
          <button className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Manage teachers
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherPerformanceDashboard;
