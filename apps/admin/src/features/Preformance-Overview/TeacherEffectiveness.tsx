"use client";
import React from "react";
import { Trophy } from "lucide-react";
import { useTeacherPerformance } from "./hooks/useAnalytics";

export const TeacherEffectiveness: React.FC = () => {
  const { data: teachers, isLoading } = useTeacherPerformance();

  return (
    <div className="w-full">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="font-mono text-base font-semibold text-gray-800">
          Teaching Effectiveness
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Mean student score across each teacher&apos;s courses and exam-prep programs.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
        {isLoading && <p className="p-8 text-sm text-gray-400">Loading…</p>}
        {teachers && teachers.length === 0 && (
          <p className="p-8 text-sm text-gray-400">
            No teachers have measured student activity yet.
          </p>
        )}
        {teachers && teachers.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {teachers.map((teacher, index) => (
              <li
                key={teacher.teacher_id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {index === 0 ? <Trophy className="h-3.5 w-3.5 text-amber-500" /> : index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {teacher.teacher_name || "Unnamed teacher"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {teacher.student_count} student{teacher.student_count === 1 ? "" : "s"} ·{" "}
                      {teacher.total_points} pts
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900 shrink-0">
                  {teacher.average_performance}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeacherEffectiveness;
