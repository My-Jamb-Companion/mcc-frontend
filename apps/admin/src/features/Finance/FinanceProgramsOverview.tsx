"use client";

import React, {useState, useMemo} from "react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type Table,
} from "@tanstack/react-table";
import {ChevronDown, ChevronRight} from "lucide-react";
import {Icon} from "@mcc/ui";
import EnhancedTable from "@/src/components/Table";

export interface StudentOverviewItem {
  id: string;
  studentName: string;
  studentEmail: string;
  avatarUrl: string;
  programTitle: string;
  programSubtitle: string;
  programBadgeIcon?: string;
  programIconUrl?: string;
  amount: number;
  dateOnboarded: string;
}

export interface ProgramOverviewItem {
  id: string;
  programTitle: string;
  programSubtitle: string;
  programBadgeIcon?: string;
  programIconUrl?: string;
  teacherName?: string | null;
  teacherAvatar?: string | null;
  number: number;
  revenuePrimary: number;
  revenueSecondary: number;
}

const studentColumnHelper = createColumnHelper<StudentOverviewItem>();
const programColumnHelper = createColumnHelper<ProgramOverviewItem>();

interface ProgramOverviewTableProps {
  studentData: StudentOverviewItem[];
  programData: ProgramOverviewItem[];
  currencySymbol?: string;
  className?: string;
  setViewStudent: (row: StudentOverviewItem) => void;
  setViewPrograms: (row: ProgramOverviewItem) => void;
}

export function FinanceProgramOverviewTable({
  studentData,
  programData,
  currencySymbol = "₦",
  className = "",
  setViewStudent,
  setViewPrograms,
}: ProgramOverviewTableProps) {
  const [activeTab, setActiveTab] = useState<"Student" | "Programs">("Student");

  const formatCurrency = (amount: number) =>
    `${currencySymbol}${new Intl.NumberFormat("en-US").format(amount)}`;

  const studentColumns = useMemo(
    () => [
      studentColumnHelper.accessor("studentName", {
        header: "Student Name",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={row.avatarUrl}
                alt={row.studentName}
                className="h-9 w-9 rounded-full bg-amber-100 object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-neutral-900">
                  {row.studentName}
                </span>
                <span className="text-xs text-neutral-400">
                  {row.studentEmail}
                </span>
              </div>
            </div>
          );
        },
      }),
      studentColumnHelper.accessor("programTitle", {
        header: "Programs",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3 min-w-[280px]">
              {row.programIconUrl ? (
                <img
                  src={row.programIconUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon icon="mdi:school-outline" size={20} />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="truncate font-semibold text-neutral-900">
                  {row.programTitle}
                </span>
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  {row.programBadgeIcon && (
                    <Icon
                      icon={row.programBadgeIcon}
                      size={14}
                      className="text-blue-500 shrink-0"
                    />
                  )}
                  <span className="truncate">{row.programSubtitle}</span>
                </div>
              </div>
            </div>
          );
        },
      }),
      studentColumnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => (
          <span className="font-bold text-neutral-900">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      studentColumnHelper.accessor("dateOnboarded", {
        header: "Date Onb.",
        cell: (info) => (
          <span className="text-xs font-medium text-neutral-500">
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [currencySymbol],
  );

  const programColumns = useMemo(
    () => [
      programColumnHelper.accessor("programTitle", {
        header: "Programs",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3 min-w-[280px]">
              {row.programIconUrl ? (
                <img
                  src={row.programIconUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon icon="mdi:school-outline" size={20} />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="truncate font-semibold text-neutral-900">
                  {row.programTitle}
                </span>
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  {row.programBadgeIcon && (
                    <Icon
                      icon={row.programBadgeIcon}
                      size={14}
                      className="text-blue-500 shrink-0"
                    />
                  )}
                  <span className="truncate">{row.programSubtitle}</span>
                </div>
              </div>
            </div>
          );
        },
      }),
      programColumnHelper.accessor("number", {
        header: "Number",
        cell: (info) => (
          <span className="font-semibold text-neutral-900">
            {info.getValue()}
          </span>
        ),
      }),
      programColumnHelper.accessor("revenuePrimary", {
        header: "Revenue",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="font-bold text-neutral-900">
                {formatCurrency(row.revenuePrimary)}
              </span>
              <span className="text-xs font-medium text-neutral-400">
                {formatCurrency(row.revenueSecondary)}
              </span>
            </div>
          );
        },
      }),
    ],
    [currencySymbol],
  );

  const studentTable = useReactTable({
    data: studentData,
    columns: studentColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const programTable = useReactTable({
    data: programData,
    columns: programColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={`w-full rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900">Program Overview</h3>
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          Monthly
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        </button>
      </div>

      <div className="mt-4 mb-2 inline-flex items-center rounded-xl bg-neutral-100/80 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("Student")}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
            activeTab === "Student"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Programs")}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
            activeTab === "Programs"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Programs
        </button>
      </div>

      <EnhancedTable
        table={
          (activeTab === "Student" ? studentTable : programTable) as Table<
            StudentOverviewItem | ProgramOverviewItem
          >
        }
        enableSelection={true}
        enableRowActions={true}
        onRowAction={(row) => {
          if ("studentName" in row) {
            setViewStudent(row);
          } else {
            setViewPrograms(row);
          }
        }}
        rowActions={
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        }
      />
    </div>
  );
}

export default FinanceProgramOverviewTable;
