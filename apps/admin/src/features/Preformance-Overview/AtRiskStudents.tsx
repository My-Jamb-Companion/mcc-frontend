"use client";
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { FormInputs } from "@mcc/features";
import { useAtRiskStudents } from "./hooks/useAnalytics";

const THRESHOLDS = [
  { label: "7+ days inactive", value: "7" },
  { label: "14+ days inactive", value: "14" },
  { label: "30+ days inactive", value: "30" },
];

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const daysInactive = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

export const AtRiskStudents: React.FC = () => {
  const [days, setDays] = useState("14");
  const { data, isLoading } = useAtRiskStudents(Number(days));

  return (
    <div className="w-full">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="font-mono text-base font-semibold text-gray-800">At-Risk Students</h2>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-gray-400">Active students</span>
            <span className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? "…" : data?.total_active_students ?? 0}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs text-gray-400">At risk</span>
            <span className="mt-1 text-2xl font-bold text-rose-600">
              {isLoading ? "…" : data?.at_risk_count ?? 0}
            </span>
          </div>
        </div>

        <div className="relative">
          <FormInputs
            type="select"
            value={days}
            onChange={setDays}
            options={THRESHOLDS}
            selectRadius="full"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
        {isLoading && <p className="p-8 text-sm text-gray-400">Loading…</p>}
        {data && data.items.length === 0 && (
          <p className="p-8 text-sm text-gray-400">No students inactive for {days}+ days.</p>
        )}
        {data && data.items.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {data.items.map((student) => (
              <li key={student.user_id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {student.full_name || student.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{student.email}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-gray-700">
                    {daysInactive(student.last_activity_at)} days inactive
                  </p>
                  <p className="text-xs text-gray-400">
                    Last active {formatWhen(student.last_activity_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AtRiskStudents;
