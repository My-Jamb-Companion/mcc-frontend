"use client";

import {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import Image from "next/image";
import {Button, Icon} from "@mcc/ui";
import {Student} from "../types/types";
import {useActiveStudentDetail} from "../hooks/useActiveStudents";
import {
  ApiActiveStudentDetail,
  ApiProgramPerformance,
  ApiProgramTeacher,
  ApiUpcomingSession,
} from "../services/student.service";

interface ViewActiveStudentProps {
  isOpen: boolean;
  student: Student | null;
  onDisableStudent: (student: Student) => void;
  onClose: () => void;
}

function formatDateTime(iso: string | null | undefined): {date: string; time: string} {
  if (!iso) return {date: "—", time: ""};
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"}),
    time: d.toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"}),
  };
}

export default function ViewActiveStudent({
  isOpen,
  student,
  onClose,
  onDisableStudent,
}: ViewActiveStudentProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const {data: detail, isLoading} = useActiveStudentDetail(
    isOpen ? student?.id : undefined,
  );

  return (
    <AnimatePresence>
      {isOpen && student ? (
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
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-150 bg-white p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
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

                <div className="absolute bottom-2 left-1/2 z-20 w-[96%] -translate-x-1/2 rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-medium text-white text-xl">
                        {student.name}
                      </h1>
                      <h1 className="flex items-center gap-1 text-gray-400 text-xs">
                        <div className="h-1.5 w-1.5  bg-green-500 rounded-full" />
                        <span>Active student</span>
                      </h1>
                    </div>

                    <div className="flex flex-col gap-3 ">
                      <div className="flex items-center gap-6">
                        <p className="text-gray-400 text-xs">
                          Onboarding level
                        </p>
                        <p className="text-white text-xs font-medium">
                          {isLoading ? "…" : `${detail?.onboarding_progress ?? 0}%`}
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
                              width: `${detail?.onboarding_progress ?? 0}%`,
                              transform: "skewX(1deg)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <PersonalDetails
                  email={detail?.email ?? student.email}
                  phone={detail?.phone}
                  username={detail?.username}
                  location={detail?.location ?? student.location}
                />

                <ProgramOfChoice
                  programs={detail?.program_performance ?? []}
                  isLoading={isLoading}
                />

                <LearningInformation detail={detail} isLoading={isLoading} />

                <UpcomingSessions
                  sessions={detail?.upcoming_sessions ?? []}
                  teachers={detail?.program_teachers ?? []}
                  isLoading={isLoading}
                />

                <ProgramTeachers
                  teachers={detail?.program_teachers ?? []}
                  isLoading={isLoading}
                />
              </div>

              <Button
                variant={"ghost"}
                width={"full"}
                className="text-red-500"
                onClick={() => onDisableStudent(student)}
              >
                Disable Student
              </Button>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function PersonalDetails({
  email,
  phone,
  username,
  location,
}: {
  email: string;
  phone?: string | null;
  username?: string | null;
  location: string;
}) {
  const [revealed, setRevealed] = useState(false);

  const maskedPhone = phone ? `${phone.slice(0, 7)}${"*".repeat(Math.max(phone.length - 7, 0))}` : null;

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
            icon="lucide:user-check"
            size={18}
            className="text-gray-500 shrink-0"
          />
          <span className="text-sm font-medium text-gray-600">
            {username || "—"}
          </span>
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

function ProgramOfChoice({
  programs,
  isLoading,
}: {
  programs: ApiProgramPerformance[];
  isLoading: boolean;
}) {
  return (
    <div className="w-full border-t border-muted/30 mt-6 pt-4">
      <h2 className="text-sm font-semibold text-subtle mb-2">
        Program of choice
      </h2>

      {isLoading ? (
        <p className="text-xs text-gray-400 py-4">Loading…</p>
      ) : programs.length === 0 ? (
        <p className="text-xs text-gray-400 py-4">Not enrolled in any programs.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {programs.map((program) => (
            <div
              key={program.program_id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center bg-emerald-50 text-emerald-600">
                  <Icon
                    icon={
                      program.program_type === "course"
                        ? "ph:book-open-duotone"
                        : "ph:exam-duotone"
                    }
                    size={22}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {program.program_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {program.level} level
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {program.average_performance}%
                </p>
                <p className="text-xs text-gray-500">
                  {program.total_points} points
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LearningInformation({
  detail,
  isLoading,
}: {
  detail: ApiActiveStudentDetail | undefined;
  isLoading: boolean;
}) {
  const joined = formatDateTime(detail?.date_joined);
  const onboarded = formatDateTime(detail?.date_onboarded);

  return (
    <div className="w-full border-t border-muted/30 mt-6 pt-4">
      <h2 className="text-sm font-semibold text-subtle mb-2">
        Learning Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-900 mb-1">
              Date Joined
            </p>
            <p className="text-xs text-gray-500">
              {isLoading ? "…" : joined.date}
              {joined.time && (
                <>
                  <span className="mx-1 text-gray-300">|</span>
                  {joined.time}
                </>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-1">
              Average performance per course
            </p>
            <p className="text-xs text-gray-600">
              {isLoading
                ? "…"
                : `${detail?.average_performance_per_course ?? 0}%`}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">
              Points:
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50/80 border border-orange-200/60 px-3 py-1 text-xs">
              <Icon icon="mage:coin-b-fill" className="text-amber-500" size={20} />
              <span className="font-bold text-gray-900">
                {isLoading ? "…" : detail?.total_points ?? 0}
              </span>
              <span className="text-gray-500 text-xs">points</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mt-4">
              <span>All time</span>
              <span className="ml-1">
                <Icon icon="mage:coin-b-fill" className="text-amber-500" size={20} />
              </span>
              <span className="font-bold text-gray-900 text-xs">
                {isLoading ? "…" : detail?.total_points_all_time ?? 0}
              </span>
              <span className="text-gray-500">points</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-900 mb-1">
              Date Onboarded
            </p>
            <p className="text-xs text-gray-500">
              {isLoading ? "…" : onboarded.date}
              {onboarded.time && (
                <>
                  <span className="mx-1 text-gray-300">|</span>
                  {onboarded.time}
                </>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">
              Leaderboard position
            </p>
            {isLoading ? (
              <p className="text-xs text-gray-400">…</p>
            ) : detail?.leaderboard_position ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-11 flex items-start justify-center pt-2 text-xs font-bold text-white shrink-0 drop-shadow-xs bg-[#8b5cf6]"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
                  }}
                >
                  #{detail.leaderboard_position}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Platform rank
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Not ranked yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UpcomingSessions({
  sessions,
  teachers,
  isLoading,
}: {
  sessions: ApiUpcomingSession[];
  teachers: ApiProgramTeacher[];
  isLoading: boolean;
}) {
  const teacherName = (teacherId: string) =>
    teachers.find((t) => t.teacher_id === teacherId)?.teacher_name;

  return (
    <div className="w-full max-w-xl font-sans text-gray-800 border-t border-muted/30 mt-6 pt-4">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Upcoming sessions
      </h3>

      {isLoading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-gray-400">No upcoming sessions.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.slice(0, 3).map((session) => {
            const {date, time} = formatDateTime(session.scheduled_at);
            return (
              <div
                key={session.session_id}
                className="relative w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate max-w-[280px]">
                      {session.title}
                    </h4>
                    {session.teacher_id && teacherName(session.teacher_id) && (
                      <p className="text-xs font-semibold text-gray-700">
                        {teacherName(session.teacher_id)}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs font-medium text-purple-600">
                      <Icon icon="lucide:timer" size={13} />
                      <span>
                        {date}
                        {time && ` · ${time}`} · {session.duration_minutes}min
                      </span>
                    </div>
                  </div>

                  {session.meeting_url && (
                    <a
                      href={session.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-full bg-[#111318] px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
                    >
                      <Icon icon="lucide:video" size={15} />
                      Join
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgramTeachers({
  teachers,
  isLoading,
}: {
  teachers: ApiProgramTeacher[];
  isLoading: boolean;
}) {
  return (
    <div className="w-full border-t border-muted/30 mt-6 pt-4">
      <h3 className="text-base font-semibold text-gray-800 mb-6">
        Program Teachers
      </h3>

      {isLoading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : teachers.length === 0 ? (
        <p className="text-xs text-gray-400">
          No teachers for this student&apos;s programs yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {teachers.map((teacher) => (
            <div key={teacher.teacher_id} className="flex items-center gap-3.5">
              <div className="relative shrink-0 p-0.5 rounded-full border border-gray-200/80 bg-white shadow-2xs">
                <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                  {teacher.teacher_name?.[0]?.toUpperCase() || "?"}
                </div>
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {teacher.teacher_name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {teacher.subject || teacher.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
