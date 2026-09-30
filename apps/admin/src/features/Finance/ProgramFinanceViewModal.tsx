"use client";
import {X} from "lucide-react";
import {ProgramOverviewItem} from "./FinanceProgramsOverview";

interface ProgramFinanceViewModalProps {
  program: ProgramOverviewItem | null;
  onClose: () => void;
}
export default function ProgramFinanceViewModal({
  program,
  onClose,
}: ProgramFinanceViewModalProps) {
  if (!program) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ProgramDetailCard
          title={program.programTitle}
          imageUrl={program.programIconUrl}
          numberSold={program.number}
          revenuePrimary={program.revenuePrimary}
          revenueSecondary={program.revenueSecondary}
          teachers={
            program.teacherName
              ? [
                  {
                    id: program.id,
                    name: program.teacherName,
                    roleOrEmail: "",
                    avatarUrl: program.teacherAvatar ?? undefined,
                  },
                ]
              : []
          }
        />
      </div>
    </div>
  );
}

function ProgramDetailCard({
  title,
  imageUrl,
  numberSold,
  revenuePrimary,
  revenueSecondary,
  currencySymbol = "₦",
  teachers,
  className = "",
}: ProgramDetailCardProps) {
  const formatCurrency = (amount: number) =>
    `${currencySymbol}${new Intl.NumberFormat("en-US").format(amount)}`;

  return (
    <div className={`p-6 ${className}`}>
      {/* Program Banner Image */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] w-full max-w-[240px] bg-neutral-100">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Program Title */}
      <h2 className="mt-5 text-xl font-bold leading-snug text-neutral-900">
        {title}
      </h2>

      {/* Overview Section */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-neutral-500">Overview</h3>

        <div className="mt-3 flex items-start gap-12">
          {/* No. Sold */}
          <div>
            <span className="text-xs font-semibold text-neutral-600">
              No. Sold
            </span>
            <p className="mt-1 text-2xl font-extrabold text-neutral-900">
              {numberSold}
            </p>
          </div>

          {/* Revenue */}
          <div>
            <span className="text-xs font-semibold text-neutral-600">
              Revenue
            </span>
            <p className="mt-1 text-2xl font-extrabold text-neutral-900">
              {formatCurrency(revenuePrimary)}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-neutral-400">
              {formatCurrency(revenueSecondary)}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-6 border-neutral-100" />

      {/* Program Teachers Section */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-500">
          Program Teachers
        </h3>

        {teachers.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">No teacher assigned.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-y-4 gap-x-6">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center gap-3">
                {teacher.avatarUrl ? (
                  <img
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-100" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-bold text-neutral-900">
                    {teacher.name}
                  </span>
                  {teacher.roleOrEmail && (
                    <span className="truncate text-xs font-medium text-neutral-400">
                      {teacher.roleOrEmail}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ProgramTeacher {
  id: string;
  name: string;
  roleOrEmail: string;
  avatarUrl?: string;
}

export interface ProgramDetailCardProps {
  title: string;
  imageUrl?: string;
  numberSold: number;
  revenuePrimary: number;
  revenueSecondary: number;
  currencySymbol?: string;
  teachers: ProgramTeacher[];
  className?: string;
}
