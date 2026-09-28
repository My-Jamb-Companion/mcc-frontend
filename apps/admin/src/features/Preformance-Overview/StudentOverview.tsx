"use client";

import React from "react";
import Link from "next/link";
import {UserCheck, Users, TrendingUp} from "lucide-react";
import {usePlatformOverview, useStudentPopulationCounts} from "./hooks/useAnalytics";

export const StudentPerformanceDashboard: React.FC = () => {
  const {data: overview, isLoading: overviewLoading} = usePlatformOverview();
  const {activeTotal, prospectiveTotal, isLoading: countsLoading} =
    useStudentPopulationCounts();

  const totalEnrolled = activeTotal + prospectiveTotal;

  return (
    <div className="w-full">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="font-mono text-base font-semibold text-gray-800">
          Student Performance
        </h2>
      </div>

      <div className="mb-8 flex items-center gap-12">
        <div className="flex flex-col">
          <span className="font-mono text-xs text-gray-400">
            Total No of students
          </span>
          <span className="mt-1 text-2xl font-bold text-gray-900">
            {overviewLoading ? "…" : overview?.total_students ?? 0}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="font-mono text-xs text-gray-400">
            No of courses
          </span>
          <span className="mt-1 text-2xl font-bold text-gray-900">
            {overviewLoading ? "…" : overview?.total_courses ?? 0}
          </span>
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
                {countsLoading ? "…" : totalEnrolled}
              </span>
            </div>

            <div className="relative grid grid-cols-1 gap-y-8 md:col-span-7 md:grid-cols-3 md:gap-x-8">
              <div className="flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                  <span>Prospective</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {countsLoading ? "…" : prospectiveTotal}
                </span>
              </div>

              <div className="flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>Active</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {countsLoading ? "…" : activeTotal}
                </span>
              </div>

              <div className="flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <span>Avg performance.</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {overviewLoading ? "…" : `${overview?.average_performance ?? 0}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/students/active-students"
          className="block bg-gray-50/80 py-3.5 text-center text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors border-t border-gray-100"
        >
          Manage students
        </Link>
      </div>
    </div>
  );
};

export default StudentPerformanceDashboard;
