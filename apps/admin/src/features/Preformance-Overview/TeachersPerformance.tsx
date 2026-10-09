"use client";
import React from "react";
import {Info, User, Users, ArrowUpRight, ArrowDownRight} from "lucide-react";
import {FormInputs} from "@mcc/features";
import Link from "next/link";
import {useStaffOverview} from "./hooks/useAnalytics";
import {compactCount, TIMEFRAMES, trend} from "./staffTrend";

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
  if (change === "New") {
    return <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">New</span>;
  }
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
  const [days, setDays] = React.useState<string>("30");
  const {data, isLoading, isError} = useStaffOverview(Number(days));
  const label = TIMEFRAMES.find((t) => t.value === days)?.label ?? "";
  const previous = `previous ${days} days`;
  const dash = isLoading || isError || !data;
  const show = (n: number | undefined) => (dash || n === undefined ? "—" : compactCount(n));
  const teacherTrend = data ? trend(data.teachers.new_in_period, data.teachers.new_in_previous_period) : null;
  const adminTrend = data ? trend(data.admins.new_in_period, data.admins.new_in_previous_period) : null;
  const sessionTrend = data ? trend(data.live_sessions, data.live_sessions_previous) : null;

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
              <span>Teacher applications waiting</span>
              <span title="Teachers who finished signing up and need an admin to approve them">
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </span>
            </div>
            <span className="mt-1 text-2xl font-bold text-gray-900">{show(data?.pending_teachers)}</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
              <span>Live classes ({label})</span>
              <span title="Classes scheduled in the period that weren't cancelled">
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </span>
            </div>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-900">{show(data?.live_sessions)}</span>
              {sessionTrend && <TrendBadge change={sessionTrend.label} isPositive={sessionTrend.isPositive} timeframe={previous} />}
            </div>
          </div>
        </div>

        <div className="relative">
          <FormInputs
            type="select"
            value={days}
            onChange={(value) => setDays(value)}
            options={TIMEFRAMES}
            selectRadius="full"
          />
        </div>
      </div>

      {isError && <p className="mb-4 text-sm text-red-600">The staff figures couldn&apos;t be loaded.</p>}

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
        <div className="p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
            <div className="flex flex-col items-center justify-center text-center md:col-span-5">
              <span className="font-mono text-sm tracking-wide text-gray-400">
                Teachers & Admin.
              </span>
              <span className="mt-3 text-6xl font-bold tracking-tight text-gray-900">
                {dash ? "—" : compactCount(data.teachers.total + data.admins.total)}
              </span>
            </div>

            <div className="relative grid grid-cols-1 gap-y-8 md:col-span-7 md:grid-cols-2 md:gap-x-12">
              <div className="flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>Teachers</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900">{show(data?.teachers.total)}</span>
                  {teacherTrend && (
                    <TrendBadge change={teacherTrend.label} isPositive={teacherTrend.isPositive} timeframe={previous} />
                  )}
                </div>
                <p className="text-[11px] text-gray-400">{show(data?.teachers.new_in_period)} joined in {label}</p>
              </div>

              <div className="flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>Other admins</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900">{show(data?.admins.total)}</span>
                  {adminTrend && (
                    <TrendBadge change={adminTrend.label} isPositive={adminTrend.isPositive} timeframe={previous} />
                  )}
                </div>
                <p className="text-[11px] text-gray-400">{show(data?.admins.new_in_period)} joined in {label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/80 py-3.5 text-center border-t border-gray-100">
          <Link href="/dashboard/teachers" className="text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Manage teachers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherPerformanceDashboard;
