import React from "react";
import {
  Info,
  Search,
  UserCheck,
  Users,
  Receipt,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

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

export const StudentPerformanceDashboard: React.FC = () => {
  return (
    <div className="w-full">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="font-mono text-base font-semibold text-gray-800">
          Student Performance
        </h2>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
              <span>Total No of students</span>
              <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer" />
            </div>
            <span className="mt-1 text-2xl font-bold text-gray-900">2.4k</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
              <span>No of courses</span>
              <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer" />
            </div>
            <span className="mt-1 text-2xl font-bold text-gray-900">20</span>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
          <input
            type="text"
            placeholder="Find course"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
        <div className="p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
            <div className="flex flex-col items-center justify-center text-center md:col-span-5">
              <span className="font-mono text-sm tracking-wide text-gray-400">
                Total Enrolled <br /> student.
              </span>
              <span className="mt-3 text-6xl font-bold tracking-tight text-gray-900">
                920
              </span>
            </div>

            <div className="relative grid grid-cols-1 gap-y-8 md:col-span-7 md:grid-cols-2 md:gap-x-12">
              <div className="hidden md:absolute md:inset-y-2 md:left-1/2 md:block md:w-[1px] md:-translate-x-1/2 md:bg-gray-100" />

              <div className="flex flex-col justify-between space-y-3 pb-4 md:border-b md:border-gray-100 md:pb-6">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                  <span>Prop student</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900">500</span>
                  <TrendBadge
                    change="34.9%"
                    isPositive={false}
                    timeframe="prev month"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-3 pb-4 md:border-b md:border-gray-100 md:pb-6">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>Active</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900">420</span>
                  <TrendBadge
                    change="24.2%"
                    isPositive={true}
                    timeframe="prev month"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <Receipt className="h-4 w-4 text-gray-600" />
                  <span>Revenue Gen.</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900">
                    ₦4.5m
                  </span>
                  <TrendBadge
                    change="34.9%"
                    isPositive={true}
                    timeframe="prev month"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span>Avg performance.</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-gray-900">74%</span>
                  <TrendBadge
                    change="34.9%"
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
            Manage students
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceDashboard;
