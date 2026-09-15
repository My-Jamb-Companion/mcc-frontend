"use client";

import {X} from "lucide-react";
import {StudentOverviewItem} from "./FinanceProgramsOverview";
import Image from "next/image";
import {Icon} from "@mcc/ui";
import {PersonalDetailsProps} from "../Teachers/types/types";
import {useState} from "react";

interface StudentFinanceViewModalProps {
  student: StudentOverviewItem | null;
  onClose: () => void;
}

export default function StudentFinanceViewModal({
  student,
  onClose,
}: StudentFinanceViewModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col relative">
            <Image
              src="/assets/images/ProfileBg.png"
              alt="profileBg"
              width={800}
              height={500}
              className="w-full h-auto object-cover rounded-lg"
              priority
            />

            <div className="absolute left-1/2 top-[50%] z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="relative size-33 overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <img
                  src={student.avatarUrl}
                  alt="profile"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="absolute bottom-2 left-1/2 z-20 w-[96%] -translate-x-1/2 rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-medium text-white text-xl">
                    {student.studentName}
                  </h1>
                  <h1 className="flex items-center gap-1 text-gray-400 text-xs pt-2">
                    <div className="h-1.5 w-1.5  bg-green-500 rounded-full" />
                    <span>Active student</span>
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <PersonalDetails />
          <StudentOverviewHeader />
        </div>
      </div>
    </div>
  );
}

function PersonalDetails({
  email = "bright@gmail.com",
  phone = "+234 905 123 4567",
  username = "mac",
  location = "Lagos, NG",
}: PersonalDetailsProps) {
  const [revealed, setRevealed] = useState(false);

  // Mask phone number showing prefix and asterisks
  const maskedPhone = "+234 905 *** ****";

  return (
    <div className="w-[80%]">
      <h2 className="text-sm font-semibold text-subtle mb-5">
        Personal Details
      </h2>

      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
        <div className="flex items-center gap-3">
          <Icon
            icon="lucide:mail"
            size={18}
            className="text-gray-500 shrink-0"
          />
          <span className="text-sm font-medium text-gray-600 truncate">
            {email}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Icon
            icon="lucide:phone"
            size={18}
            className="text-gray-500 shrink-0"
          />
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            {revealed ? phone : maskedPhone}
          </span>
          <button
            onClick={() => setRevealed((prev) => !prev)}
            className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {revealed ? "Hide" : "Reveal"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Icon
            icon="lucide:user-check"
            size={18}
            className="text-gray-500 shrink-0"
          />
          <span className="text-sm font-medium text-gray-600">{username}</span>
        </div>

        <div className="flex items-center gap-3">
          <Icon icon="emojione:flag-for-nigeria" />
          <span className="text-sm font-semibold text-gray-800">
            {location}
          </span>
        </div>
      </div>
    </div>
  );
}

function StudentOverviewHeader({
  title = "Pilates Teacher Training Certification 20...",
  subtitle = "Moderate level.",
  badgeIcon = "mdi:information-outline",
  imageUrl = "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=120&auto=format&fit=crop&q=80",
  amount = 12880,
  dateOnboarded = "05 Apr, 2026| 8:30 PM",
  revenuePrimary = 12880332,
  revenueSecondary = 9199332,
  currencySymbol = "₦",
}: StudentOverviewHeaderProps) {
  const formatCurrency = (val: number) =>
    `${currencySymbol}${new Intl.NumberFormat("en-US").format(val)}`;

  return (
    <div className={`w-full`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Icon icon="mdi:school-outline" size={22} />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <h3 className="truncate font-bold text-neutral-900 text-sm sm:text-base">
              {title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              {badgeIcon && (
                <Icon
                  icon={badgeIcon}
                  size={15}
                  className="text-blue-500 shrink-0"
                />
              )}
              <span className="truncate">{subtitle}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 text-right">
          <span className="font-bold text-neutral-900 text-sm sm:text-base">
            {formatCurrency(amount)}
          </span>
          <span className="text-xs font-medium text-neutral-400">
            {dateOnboarded}
          </span>
        </div>
      </div>

      {/* Overview Section */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-neutral-500">Overview</h4>

        <div className="mt-4">
          <span className="text-xs font-semibold text-neutral-600">
            Revenue
          </span>
          <p className="mt-1 text-3xl font-extrabold text-neutral-900 tracking-tight">
            {formatCurrency(revenuePrimary)}
          </p>
          <p className="mt-1 text-sm font-semibold text-neutral-400 line-through">
            {formatCurrency(revenueSecondary)}
          </p>
        </div>
      </div>
    </div>
  );
}
interface StudentOverviewHeaderProps {
  title?: string;
  subtitle?: string;
  badgeIcon?: string;
  imageUrl?: string;
  amount?: number;
  dateOnboarded?: string;
  revenuePrimary?: number;
  revenueSecondary?: number;
  currencySymbol?: string;
}
