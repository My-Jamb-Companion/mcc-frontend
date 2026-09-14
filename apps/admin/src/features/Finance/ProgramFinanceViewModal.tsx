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

  console.log(program);

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
          title={program.title}
          imageUrl={program.imageUrl}
          numberSold={program.numberSold}
          revenuePrimary={program.revenuePrimary}
          revenueSecondary={program.revenueSecondary}
          currencySymbol={program.currencySymbol}
          teachers={program.teachers}
        />
      </div>
    </div>
  );
}

function ProgramDetailCard({
  title = "Pilates Teacher Training Certification 20 CPD Points",
  imageUrl = "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
  numberSold = 138,
  revenuePrimary = 12880332,
  revenueSecondary = 9199332,
  currencySymbol = "₦",
  teachers = DEFAULT_TEACHERS,
  className = "",
}: ProgramDetailCardProps) {
  const formatCurrency = (amount: number) =>
    `${currencySymbol}${new Intl.NumberFormat("en-US").format(amount)}`;

  return (
    <div className={`p-6 ${className}`}>
      {/* Program Banner Image */}
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] w-full max-w-[240px]">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
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

        <div className="mt-4 grid grid-cols-2 gap-y-4 gap-x-6">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center gap-3">
              <img
                src={teacher.avatarUrl}
                alt={teacher.name}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-bold text-neutral-900">
                  {teacher.name}
                </span>
                <span className="truncate text-xs font-medium text-neutral-400">
                  {teacher.roleOrEmail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface ProgramTeacher {
  id: string;
  name: string;
  roleOrEmail: string;
  avatarUrl: string;
}

export interface ProgramDetailCardProps {
  title?: string;
  imageUrl?: string;
  numberSold?: number;
  revenuePrimary?: number;
  revenueSecondary?: number;
  currencySymbol?: string;
  teachers?: ProgramTeacher[];
  className?: string;
}

const DEFAULT_TEACHERS: ProgramTeacher[] = [
  {
    id: "1",
    name: "Seline",
    roleOrEmail: "Biology teacher",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Mo",
    roleOrEmail: "bright@gmail.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Tosin",
    roleOrEmail: "Physics teacher",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Pilates",
    roleOrEmail: "Pilates teacher",
    avatarUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&auto=format&fit=crop&q=80",
  },
];
