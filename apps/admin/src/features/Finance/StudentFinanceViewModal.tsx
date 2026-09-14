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

  console.log(student);

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
