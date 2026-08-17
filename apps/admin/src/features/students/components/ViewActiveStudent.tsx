import {useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import Image from "next/image";
import {Button, Icon} from "@mcc/ui";
import {Student, PersonalDetailsProps} from "../types/types";

interface ViewActiveStudentProps {
  isOpen: boolean;
  student: Student | null;
  onDisableStudent: (student: Student) => void;
  onClose: () => void;
}

interface ProgramAttempt {
  id: string;
  label: string;
  date: string;
  time: string;
  correct: number;
  total: number;
  points: number;
  diamonds: number;
}

interface EnrolledProgram {
  id: string;
  avatar: string;
  title: string;
  subtitle: string;
  showInfoIcon?: boolean;
  attempts: ProgramAttempt[];
}

interface LeaderboardRankProps {
  rank: number;
  label: string;
  icon: React.ReactNode;
  variant: "grey" | "teal" | "purple";
}
interface BadgeItem {
  id: string;
  rank: number;
  date: string;
  time: string;
  description: string;
  diamonds: number;
  coins: number;
}

interface UpcomingSessionProps {
  sessionTag?: string;
  courseTitle?: string;
  hosts?: string;
  timeText?: string;
  countdownText?: string;
  callsTakenCount?: number;
  onMoreClick?: () => void;
  onJoinClick?: () => void;
}
interface Teacher {
  id: string;
  name: string;
  roleOrEmail: string;
  avatarUrl?: string;
}

export default function ViewActiveStudent({
  isOpen,
  student,
  onClose,
  onDisableStudent,
}: ViewActiveStudentProps) {
  // Optional: Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
                        <p className="text-white text-xs font-medium">94%</p>
                      </div>

                      <div className="relative flex items-center justify-center h-3">
                        <div
                          className="w-full border border-white/50 h-full rounded-xs "
                          style={{
                            transform: "skewX(22deg)",
                          }}
                        >
                          <div
                            className="absolute left-0 z-10 w-[78%] rounded-tr-xs rounded-br-xs bg-white h-full"
                            style={{
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
                <PersonalDetails />

                <ProgramOfChoice />

                <LearningInformation />

                <StudentBadges />

                <UpcomingSession />

                <ProgramTeachers />
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

function ProgramOfChoice({
  programs = PROGRAMS,
}: {
  programs?: EnrolledProgram[];
}) {
  function AttemptRow({
    attempt,
    isLast,
  }: {
    attempt: ProgramAttempt;
    isLast: boolean;
  }) {
    return (
      <div className="relative pl-8">
        <div className="absolute left-0 top-0 bottom-0 w-6">
          <div
            className={`absolute left-0 top-0 w-6 h-6 border-l-2 border-b-2 border-gray-200 rounded-bl-xl`}
          />
          {!isLast && (
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 ml-0" />
          )}
        </div>

        <div
          className={`flex items-start justify-between gap-4 pb-6 ${!isLast ? "border-b border-gray-100 mb-6" : ""}`}
        >
          <div>
            <p className="text-sm font-semibold">{attempt.label}</p>
            <p className="text-[11px] text-subtle mt-1">
              {attempt.date}
              <span className="text-subtle mx-1">|</span>
              {attempt.time}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-subtle">
              <span className="font-semibold ">
                {attempt.correct}/{attempt.total}
              </span>{" "}
              correct <span className="mx-1">•</span>
              <span className="font-semibold">{attempt.points}</span> points
            </p>
            <p className="text-xs font-medium text-subtle mt-1 flex items-center justify-end gap-1">
              You earned
              <Icon icon="lucide:gem" size={14} className="text-sky-500" />
              <span className="font-semibold text-subtle">
                {attempt.diamonds} Diamonds
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  function ProgramRow({
    program,
    defaultExpanded = false,
  }: {
    program: EnrolledProgram;
    defaultExpanded?: boolean;
  }) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
      <div>
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-xs font-semibold`}
            >
              <img
                src={program.avatar}
                alt={program.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {program.title}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                {program.showInfoIcon && (
                  <Icon icon="lucide:info" size={14} className="text-sky-500" />
                )}
                {program.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors shrink-0"
          >
            {expanded ? "Hide performance" : "See performance"}
            <Icon
              icon={expanded ? "lucide:chevron-up" : "lucide:chevron-down"}
              size={16}
            />
          </button>
        </div>

        {expanded && (
          <div className="pl-1 pb-2">
            {program.attempts.map((attempt, idx) => (
              <AttemptRow
                key={attempt.id}
                attempt={attempt}
                isLast={idx === program.attempts.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full border-t border-muted/30 mt-6 pt-4">
      <h2 className="text-sm font-semibold text-subtle mb-2">
        Program of choice
      </h2>
      <div className="divide-y divide-gray-100">
        {programs.map((program, idx) => (
          <ProgramRow
            key={program.id}
            program={program}
            defaultExpanded={idx === 0}
          />
        ))}
      </div>
    </div>
  );
}

function LearningInformation() {
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
              05 Apr, 2026<span className="mx-1 text-gray-300">|</span>8:30 PM
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-1">
              Average performance per course
            </p>
            <p className="text-xs text-gray-600">
              130/300 <span className="text-gray-400 mx-1">•</span> 234 points
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">
              Avai. points:
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50/80 border border-orange-200/60 px-3 py-1 text-xs">
              <span className="text-base">
                <Icon
                  icon="mage:coin-b-fill"
                  className="text-amber-500"
                  size={20}
                />
              </span>
              <span className="font-bold text-gray-900">8,299</span>
              <span className="text-gray-500 text-xs">points</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mt-4 cursor-pointer hover:text-gray-900">
              <span>All time</span>
              <Icon icon="lucide:chevron-down" size={14} />
              <span className="ml-1 text-base">
                <Icon
                  icon="mage:coin-b-fill"
                  className="text-amber-500"
                  size={20}
                />
              </span>
              <span className="font-bold text-gray-900 text-xs">23,456</span>
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
              05 Apr, 2026<span className="mx-1 text-gray-300">|</span>8:30 PM
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 mb-0.5">
              L. Board position
            </p>
            <p className="text-xs italic text-gray-400 mb-4">
              last updated: 05 Apr, 2026| 8:30 PM
            </p>

            <div className="flex flex-col space-y-3">
              <RibbonBadge
                rank={21}
                label="Worldwide"
                variant="grey"
                icon={
                  <Icon
                    icon="material-symbols:globe"
                    size={18}
                    className="text-gray-700"
                  />
                }
              />
              <RibbonBadge
                rank={3}
                label="Nigeria"
                variant="teal"
                icon={<Icon icon="emojione:flag-for-nigeria" />}
              />
              <RibbonBadge
                rank={1}
                label="Ikeja, LG, NG."
                variant="purple"
                icon={
                  <Icon
                    icon="mingcute:map-pin-line"
                    size={18}
                    className="text-gray-700"
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentBadges() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({left: scrollAmount, behavior: "smooth"});
    }
  };

  return (
    <div className="w-full border-t border-muted/30 mt-6 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-subtle mb-2">
          Student badges
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <Icon icon="lucide:chevron-left" size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Icon icon="lucide:chevron-right" size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none pt-4 pb-2"
        style={{scrollbarWidth: "none"}}
      >
        {BADGES.map((badge) => (
          <div
            key={badge.id}
            className="relative flex-none w-90 rounded-2xl border border-muted/30 bg-white px-4 py-3.5 shadow-2xs"
          >
            <div
              className="absolute -top-3 right-8 w-8 h-12 bg-[#8b5cf6] flex items-start justify-center pt-1.5 text-xs font-bold text-white shadow-sm"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
              }}
            >
              #{badge.rank}
            </div>

            <p className="text-[10px] text-subtle mb-2">
              {badge.date}
              <span className="mx-1 text-gray-300">|</span>
              {badge.time}
            </p>

            <p className="text-xs font-medium leading-snug mb-2">
              {badge.description}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
              <div className="flex items-center gap-1.5">
                💎
                <span>{badge.diamonds}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon
                  icon="mage:coin-b-fill"
                  size={16}
                  className="text-amber-400"
                />
                <span>{badge.coins}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RibbonBadge({rank, label, icon, variant}: LeaderboardRankProps) {
  const BADGE_COLORS = {
    grey: "bg-[#6c707a]",
    teal: "bg-[#38bfa1]",
    purple: "bg-[#8b5cf6]",
  };
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-11 flex items-start justify-center pt-2 text-xs font-bold text-white shrink-0 drop-shadow-xs ${BADGE_COLORS[variant]}`}
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
        }}
      >
        #{rank}
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
    </div>
  );
}

function UpcomingSession({
  sessionTag = "Pilates Class (Session #3)",
  courseTitle = "Pilates Teacher Training Certification...",
  hosts = "Bright & Salima Spiff",
  timeText = "7 PM WAT, Wed. 07 2025.",
  countdownText = "12h : 23m :3s",
  callsTakenCount = 21,
  onMoreClick,
  onJoinClick,
}: UpcomingSessionProps) {
  return (
    <div className="w-full max-w-xl font-sans text-gray-800">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Upcoming session
      </h3>

      <div className="relative w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
        <div className="mb-3 inline-block rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {sessionTag}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold text-gray-900 truncate max-w-[280px]">
              {courseTitle}
            </h4>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden shrink-0">
                <div className="inline-block h-8 w-8 rounded-full border-2 border-white bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-700">
                  👨‍🎨
                </div>
                <div className="inline-block h-8 w-8 rounded-full border-2 border-white bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-700">
                  🧕
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {hosts}
                </p>
                <div className="flex items-center gap-1 text-xs font-medium text-purple-600 mt-0.5">
                  <Icon icon="lucide:timer" size={13} />
                  <span>{timeText}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onJoinClick}
              className="flex items-center gap-2 rounded-full bg-[#111318] pl-4 pr-1 py-1 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <span>{countdownText}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-900">
                <Icon icon="lucide:video" size={15} />
              </div>
            </button>

            <button
              onClick={onMoreClick}
              aria-label="More options"
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Icon icon="lucide:more-vertical" size={18} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-800">
        Calls taken: <span className="font-bold">{callsTakenCount}</span>
      </p>
    </div>
  );
}

function ProgramTeachers({teachers = TEACHERS}: {teachers?: Teacher[]}) {
  return (
    <div className="w-full ">
      <h3 className="text-base font-semibold text-gray-800 mb-6">
        Program Teachers
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex items-center gap-3.5">
            <div className="relative shrink-0 p-0.5 rounded-full border border-gray-200/80 bg-white shadow-2xs">
              <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white bg-gray-100">
                {teacher.avatarUrl ? (
                  <Image
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-sm font-bold text-emerald-700">
                    {teacher.name[0]}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {teacher.name}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {teacher.roleOrEmail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TEACHERS: Teacher[] = [
  {
    id: "1",
    name: "Seline",
    roleOrEmail: "Biology teacher",
    avatarUrl: "/assets/images/teachers/seline.jpg",
  },
  {
    id: "2",
    name: "Mo",
    roleOrEmail: "bright@gmail.com",
    avatarUrl: "/assets/images/teachers/mo.jpg",
  },
  {
    id: "3",
    name: "Tosin",
    roleOrEmail: "Physics teacher",
    avatarUrl: "/assets/images/teachers/tosin.jpg",
  },
  {
    id: "4",
    name: "Pilates",
    roleOrEmail: "Pilates teacher",
    avatarUrl: "/assets/images/teachers/pilates.jpg",
  },
];

const PROGRAMS: EnrolledProgram[] = [
  {
    id: "1",
    avatar: "https://i.pravatar.cc/300?img=22",
    title: "Pilates Teacher Training Certification 20 CPD Points",
    subtitle: "Moderate level.",
    showInfoIcon: true,
    attempts: [
      {
        id: "a1",
        label: "Practice #1",
        date: "05 Apr, 2026",
        time: "8:30 PM",
        correct: 15,
        total: 15,
        points: 475,
        diamonds: 3,
      },
      {
        id: "a1",
        label: "Practice #1",
        date: "05 Apr, 2026",
        time: "8:30 PM",
        correct: 15,
        total: 15,
        points: 475,
        diamonds: 3,
      },
      {
        id: "a2",
        label: "Practice #1",
        date: "05 Apr, 2026",
        time: "8:30 PM",
        correct: 15,
        total: 15,
        points: 475,
        diamonds: 3,
      },
    ],
  },
  {
    id: "2",

    avatar: "https://i.pravatar.cc/300?img=43",
    title: "West African Examination Council - WAEC",
    subtitle: "English, Maths, Physics & 3 more…",
    attempts: [
      {
        id: "b1",
        label: "Mock Exam #1",
        date: "02 Apr, 2026",
        time: "6:00 PM",
        correct: 48,
        total: 60,
        points: 1180,
        diamonds: 5,
      },
    ],
  },
];
const BADGES: BadgeItem[] = [
  {
    id: "1",
    rank: 1,
    date: "05 Apr, 2026",
    time: "8:30 PM",
    description:
      "You finished top 3 this week and you have earned some reward.",
    diamonds: 290,
    coins: 290,
  },
  {
    id: "2",
    rank: 1,
    date: "05 Apr, 2026",
    time: "8:30 PM",
    description:
      "You finished top 3 this week and you have earned some reward.",
    diamonds: 290,
    coins: 290,
  },
  {
    id: "3",
    rank: 2,
    date: "05 Apr, 2026",
    time: "8:30 PM",
    description:
      "You finished top 3 this week and you have earned some reward.",
    diamonds: 150,
    coins: 150,
  },
];
