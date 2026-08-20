import {AnimatePresence, Button, Icon, motion} from "@mcc/ui";

import Image from "next/image";
import {useEffect, useState} from "react";
import {Method, PersonalDetailsProps, ProspectiveStudent} from "../types/types";

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

              <div className="flex flex-col gap-8">
                <PersonalDetails />
                <div>
                  <h3 className="text-sm text-subtle font-semibold pb-4">
                    Program of choice
                  </h3>
                  <ProgramCard method={student.method} />
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
  email = "bright@gmail.com",
  phone = "+234 905 123 4567",
  username = "mac",
  location = "Lagos, NG",
}: PersonalDetailsProps) {
  const [revealed, setRevealed] = useState(false);

  const maskedPhone = "+234 905 *** ****";

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

function ProgramCard({
  logoUrl = "https://upload.wikimedia.org/wikipedia/commons/e/eb/JAMB_Logo.png",
  instructorName = "Matthew James",
  instructorAvatar = "https://i.pravatar.cc/100?img=33",
  rating = 4.7,
  reviewsCount = "5.2k",
  method,
}: ProgramCardProps) {
  return (
    <div className="flex items-center gap-4 p-2 bg-white rounded-2xl max-w-2xl font-sans">
      <div className="relative flex items-center justify-center w-28 h-28 rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-gray-50/50 p-3 shrink-0 overflow-hidden shadow-xs">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #10b981 10%, transparent 70%)`,
          }}
        />
        <img
          src={logoUrl}
          // alt={name}
          className="w-full h-full object-contain relative z-10"
        />
      </div>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={instructorAvatar}
              alt={instructorName}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
            <span className="font-medium text-gray-700 truncate">
              {instructorName}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Icon icon="ri:star-fill" size={14} className="text-gray-800" />
            <span className="font-semibold text-gray-800">{rating}</span>
            <span className="text-gray-400">({reviewsCount})</span>
          </div>
        </div>

        {method.type == "badge" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            {method.label}
          </span>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-900 tracking-tight leading-snug line-clamp-1">
                {method.title}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-55">
                {method.subtitle}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProgramCardProps {
  logoUrl?: string;
  instructorName?: string;
  instructorAvatar?: string;
  rating?: number;
  reviewsCount?: string;
  title?: string;
  badgeLabel?: string;
  method: Method;
}
