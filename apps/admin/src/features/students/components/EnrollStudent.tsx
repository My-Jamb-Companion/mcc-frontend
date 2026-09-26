"use client";

import {useState, useEffect, useMemo} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Icon} from "@mcc/ui";
import {Student} from "../types/types";
import {
  useActiveStudentPrograms,
  useEnrollActiveStudent,
  useUnenrollActiveStudent,
} from "../hooks/useActiveStudents";
import {useCourses} from "@/src/features/courses/hooks/useCourses";
import {useExamPrograms} from "@/src/features/Exam-program/hooks/useExamPrograms";

interface EnrollStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AvailableItem {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  type: "course" | "exam";
}

export default function EnrollStudentModal({
  student,
  isOpen,
  onClose,
}: EnrollStudentModalProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "exams">("courses");
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const {programPerformance} = useActiveStudentPrograms(
    isOpen ? student?.id : undefined,
  );
  const {courses} = useCourses({status: "published", limit: 100});
  const {programs: examPrograms} = useExamPrograms({status: "published", limit: 100});
  const enrollMutation = useEnrollActiveStudent();
  const unenrollMutation = useUnenrollActiveStudent();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Courses have a real cover image; exam programs don't return one at all
  // (ApiExamProgramSummary has no cover_image_url field), so their rows
  // fall back to an icon placeholder instead of a fabricated stock photo.
  const courseImageById = useMemo(
    () => new Map(courses.map((c) => [c.id, c.upload?.coverImageUrl ?? null])),
    [courses],
  );

  if (!isOpen || !student) return null;

  const enrolledCourses = programPerformance.filter((p) => p.program_type === "course");
  const enrolledExams = programPerformance.filter((p) => p.program_type === "exam");
  const activeEnrolled = activeTab === "courses" ? enrolledCourses : enrolledExams;
  const enrolledIds = new Set(programPerformance.map((p) => p.program_id));

  const availableCourses: AvailableItem[] = courses.map((c) => ({
    id: c.id,
    title: c.courseName,
    subtitle: c.level ? `${c.level} level.` : "",
    image: c.upload?.coverImageUrl ?? null,
    type: "course",
  }));
  const availableExams: AvailableItem[] = examPrograms.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.tags.filter(Boolean).join(", "),
    image: null,
    type: "exam",
  }));

  const availableItems = (activeTab === "courses" ? availableCourses : availableExams)
    .filter((item) => !enrolledIds.has(item.id))
    .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleEnroll = (item: AvailableItem) => {
    setPendingId(item.id);
    enrollMutation.mutate(
      {userId: student.id, programId: item.id, programType: item.type},
      {onSettled: () => setPendingId(null)},
    );
  };

  const handleUnenroll = (programId: string, programType: "course" | "exam") => {
    setPendingId(programId);
    unenrollMutation.mutate(
      {userId: student.id, programId, programType},
      {onSettled: () => setPendingId(null)},
    );
  };

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
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-[580px] bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Enroll student
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Close panel"
                >
                  <Icon icon="lucide:x" size={18} />
                </button>
              </div>

              <div className="relative w-full h-40 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute -left-6 bottom-2 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute right-4 top-2 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  <img
                    src={
                      student.avatar ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=Elvis"
                    }
                    alt={student.name}
                    className="w-18 h-18 rounded-full border-2 border-white/80 object-cover bg-purple-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Personal Details
                </h3>

                <div className="grid grid-cols-2 gap-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="lucide:mail"
                      size={14}
                      className="text-gray-400"
                    />
                    <span>{student.email || "bright@gmail.com"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon
                      icon="lucide:phone"
                      size={14}
                      className="text-gray-400"
                    />
                    <span>
                      {isPhoneRevealed
                        ? student.phone || "+234 905 123 4567"
                        : "+234 905 *** ****"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPhoneRevealed((prev) => !prev)}
                      className="ml-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200 transition"
                    >
                      {isPhoneRevealed ? "Hide" : "Reveal"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon
                      icon="lucide:user"
                      size={14}
                      className="text-gray-400"
                    />
                    <span>{student.username || "mac"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon icon="circle-flags:ng" size={14} />
                    <span className="font-medium text-gray-700">
                      {student.location || "Lagos, NG"}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 my-1" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Enrollment List
                </h3>

                <div className="inline-flex rounded-full bg-gray-100/80 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("courses");
                      setIsSearchOpen(false);
                    }}
                    className={`rounded-full px-4 py-1.5 font-medium transition-all ${
                      activeTab === "courses"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Courses
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("exams");
                      setIsSearchOpen(false);
                    }}
                    className={`rounded-full px-4 py-1.5 font-medium transition-all ${
                      activeTab === "exams"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Exam programs
                  </button>
                </div>

                <div className="space-y-3">
                  {activeEnrolled.length === 0 && (
                    <p className="text-xs text-gray-400">
                      Not enrolled in any {activeTab === "courses" ? "courses" : "exam programs"} yet.
                    </p>
                  )}
                  {activeEnrolled.map((item) => {
                    const image =
                      item.program_type === "course"
                        ? courseImageById.get(item.program_id) ?? null
                        : null;
                    return (
                      <div
                        key={item.program_id}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {image ? (
                            <img
                              src={image}
                              alt={item.program_name}
                              className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <Icon
                                icon={
                                  item.program_type === "course"
                                    ? "ph:book-open-duotone"
                                    : "ph:exam-duotone"
                                }
                                size={18}
                                className="text-purple-500"
                              />
                            </div>
                          )}
                          <div className="truncate">
                            <h4 className="font-semibold text-gray-800 truncate">
                              {item.program_name}
                            </h4>
                            {item.level && (
                              <p className="text-gray-400 text-[11px]">{item.level} level</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={pendingId === item.program_id}
                          onClick={() => handleUnenroll(item.program_id, item.program_type)}
                          className="flex items-center gap-1 text-red-500 font-medium hover:text-red-600 transition flex-shrink-0 disabled:opacity-50"
                        >
                          <span>
                            {pendingId === item.program_id ? "Unenrolling…" : "Unenroll"}
                          </span>
                          <Icon icon="lucide:x" size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {(enrollMutation.isError || unenrollMutation.isError) && (
                  <p className="text-xs text-red-500">
                    That didn&apos;t go through. Please try again.
                  </p>
                )}

                <div className="relative pt-2">
                  {!isSearchOpen ? (
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition"
                    >
                      <span>
                        Enroll into more{" "}
                        {activeTab === "courses" ? "course" : "program"}
                      </span>
                      <Icon icon="lucide:chevron-right" size={14} />
                    </button>
                  ) : (
                    <motion.div
                      initial={{opacity: 0, y: -6}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -6}}
                      className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg space-y-3"
                    >
                      <div className="relative flex items-center rounded-xl border border-gray-200 px-3 py-2 text-xs focus-within:border-purple-500">
                        <Icon
                          icon="lucide:search"
                          size={14}
                          className="text-gray-400 mr-2"
                        />
                        <input
                          type="text"
                          placeholder="Search for programs to enroll"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {availableItems.length > 0 ? (
                          availableItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <Icon
                                      icon={
                                        item.type === "course"
                                          ? "ph:book-open-duotone"
                                          : "ph:exam-duotone"
                                      }
                                      size={16}
                                      className="text-purple-500"
                                    />
                                  </div>
                                )}
                                <div className="truncate">
                                  <h5 className="font-semibold text-gray-800 text-[11px] truncate">
                                    {item.title}
                                  </h5>
                                  <p className="text-gray-400 text-[10px]">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={pendingId === item.id}
                                onClick={() => handleEnroll(item)}
                                className="flex items-center gap-1 text-gray-600 font-medium hover:text-purple-600 transition flex-shrink-0 disabled:opacity-50"
                              >
                                <span>
                                  {pendingId === item.id ? "Enrolling…" : "Enroll"}
                                </span>
                                <Icon icon="lucide:plus-circle" size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-xs text-gray-400 py-2">
                            No available programs found
                          </p>
                        )}
                      </div>

                      <div className="pt-1 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="text-xs text-gray-400 hover:text-gray-600 transition"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 font-medium text-xs rounded-full transition duration-200 bg-purple-600 text-white shadow-md hover:bg-purple-700"
              >
                Done
              </button>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
