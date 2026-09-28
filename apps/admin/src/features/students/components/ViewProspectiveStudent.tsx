"use client";

import {AnimatePresence, Button, Icon, motion} from "@mcc/ui";

import Image from "next/image";
import {useEffect, useState} from "react";
import {Method, ProspectiveStudent} from "../types/types";
import {useProspectiveStudentDetail} from "../hooks/useProspectiveStudents";
import {ApiProspectiveStudent} from "../services/student.service";

export default function ViewProspectiveStudent({
  isOpen,
  onClose,
  student,
  onRejectStudent,
}: {
  isOpen: boolean;
  onClose: () => void;
  student: ProspectiveStudent | null;
  onRejectStudent?: (student: ProspectiveStudent) => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (student) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [student, onClose]);

  const {data: detail, isLoading} = useProspectiveStudentDetail(
    isOpen ? student?.id : undefined,
  );

  return (
    <AnimatePresence>
      {student && isOpen ? (
        <>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          />

          <motion.section
            initial={{x: "100%", opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: "100%", opacity: 0}}
            transition={{type: "tween", duration: 0.3}}
            className="fixed top-0 right-0 z-50 flex flex-col h-screen w-full max-w-150 bg-white p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col gap-6 h-full">
              <div className="flex items-center justify-between border-b border-muted/20">
                <div className="flex items-center gap-3">
                  <Button
                    variant={"ghost"}
                    leftIcon={<Icon icon="mdi-light:share" />}
                  >
                    Share
                  </Button>
                  <Button
                    variant={"ghost"}
                    leftIcon={<Icon icon="mdi-light:share" />}
                  >
                    Export
                  </Button>
                </div>

                <Button
                  onClick={onClose}
                  variant={"ghost"}
                  size={"fit"}
                  className="rounded-full py-1 px-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Close panel"
                >
                  ✕
                </Button>
              </div>

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
                      src={student.avatar}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* GLASS CARD */}
                <div className="absolute bottom-2 left-1/2 z-20 w-[96%] -translate-x-1/2 rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-medium text-white text-xl">
                        {student.name}
                      </h1>
                      <h1 className="flex items-center gap-1 text-gray-400 text-xs">
                        <div className="h-1.5 w-1.5  bg-gray-500 rounded-full" />
                        <span>Prospective student</span>
                      </h1>
                    </div>

                    <div className="flex flex-col gap-3 ">
                      <div className="flex items-center gap-6">
                        <p className="text-gray-400 text-xs">
                          Onboarding level
                        </p>
                        <p className="text-white text-xs font-medium">
                          {isLoading ? "…" : `${detail?.onboarding_level ?? 0}%`}
                        </p>
                      </div>

                      <div className="relative flex items-center justify-center h-3">
                        <div
                          className="w-full border border-white/50 h-full rounded-xs "
                          style={{
                            transform: "skewX(22deg)",
                          }}
                        >
                          <div
                            className="absolute left-0 z-10 rounded-tr-xs rounded-br-xs bg-white h-full"
                            style={{
                              width: `${detail?.onboarding_level ?? 0}%`,
                              transform: "skewX(1deg)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <PersonalDetails detail={detail} fallbackEmail={student.email} />
                <div>
                  <h3 className="text-sm text-subtle font-semibold pb-4">
                    Program of choice
                  </h3>
                  <ProgramCard method={student.method} zoomUrl={detail?.zoom_meeting_url} />
                </div>
              </div>
            </div>

            <Button
              variant={"ghost"}
              width={"full"}
              className="text-red-500 mt-auto"
              onClick={() => onRejectStudent?.(student)}
            >
              Reject Student
            </Button>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function PersonalDetails({
  detail,
  fallbackEmail,
}: {
  detail: ApiProspectiveStudent | undefined;
  fallbackEmail: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const phone = detail?.phone;
  const maskedPhone = phone
    ? `${phone.slice(0, 7)}${"*".repeat(Math.max(phone.length - 7, 0))}`
    : null;

  return (
    <div className="w-[80%]">
      <h3 className="text-sm text-subtle font-semibold pb-4">
        Personal Details
      </h3>

      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
        <div className="flex items-center gap-3">
          <Icon
            icon="lucide:mail"
            size={18}
            className="text-gray-500 shrink-0"
          />
          <span className="text-sm font-medium text-gray-600 truncate">
            {detail?.email ?? fallbackEmail}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Icon
            icon="lucide:phone"
            size={18}
            className="text-gray-500 shrink-0"
          />
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            {phone ? (revealed ? phone : maskedPhone) : "Not on file"}
          </span>
          {phone && (
            <button
              onClick={() => setRevealed((prev) => !prev)}
              className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {revealed ? "Hide" : "Reveal"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Icon
            icon="lucide:graduation-cap"
            size={18}
            className="text-gray-500 shrink-0"
          />
          <span className="text-sm font-medium text-gray-600">
            {detail?.education_level || "—"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Icon icon="emojione:flag-for-nigeria" />
          <span className="text-sm font-semibold text-gray-800">
            {detail?.location || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgramCard({method, zoomUrl}: {method: Method; zoomUrl?: string | null}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-100 max-w-2xl font-sans">
      {method.type == "badge" ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          {method.label}
        </span>
      ) : (
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 tracking-tight leading-snug line-clamp-1">
            {method.title}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-55">
            {method.subtitle}
          </p>
        </div>
      )}

      {zoomUrl && (
        <a
          href={zoomUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#111318] px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors shrink-0"
        >
          <Icon icon="lucide:video" size={15} />
          Join Zoom
        </a>
      )}
    </div>
  );
}
