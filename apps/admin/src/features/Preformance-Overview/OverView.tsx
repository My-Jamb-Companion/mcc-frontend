"use client";

import {Activity, TrendingUp} from "lucide-react";
import {usePlatformOverview} from "./hooks/useAnalytics";

export const Overview: React.FC = () => {
  const {data, isLoading} = usePlatformOverview();

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="font-mono text-base font-semibold text-gray-800">
          Overview
        </h2>
      </div>

      <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          <div className="flex flex-col items-center justify-center text-center md:col-span-5">
            <span className="font-mono text-sm tracking-wide text-gray-400">
              Total Users
            </span>
            <span className="mt-2 text-6xl font-bold tracking-tight text-gray-900">
              {isLoading ? "…" : data?.total_users ?? 0}
            </span>
          </div>

          <div className="relative grid grid-cols-1 gap-y-8 md:col-span-7 md:grid-cols-2 md:gap-x-12">
            <div className="hidden md:absolute md:inset-y-2 md:left-1/2 md:block md:w-[1px] md:-translate-x-1/2 md:bg-gray-100" />

            <div className="flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <Activity className="h-4 w-4 text-gray-600" />
                <span>Total Sessions</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {isLoading ? "…" : data?.total_sessions ?? 0}
              </span>
            </div>

            <div className="flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span>Avg. Performance</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {isLoading ? "…" : `${data?.average_performance ?? 0}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
