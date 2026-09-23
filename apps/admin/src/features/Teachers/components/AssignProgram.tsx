import {useEffect, useState} from "react";
import {motion, AnimatePresence, Icon, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {Teacher} from "../types/types";
import {
  useAssignProgram,
  useSearchPrograms,
  useTeacherDetail,
  useUnassignProgram,
} from "../hooks/useAdminTeachers";
import {TeacherProgram} from "../services/teacherPrograms.service";
import TeacherAvatar from "./TeacherAvatar";

interface AssignProgramProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function ThumbnailFor({label}: {label: string}) {
  return (
    <div className="h-10 w-10 shrink-0 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-semibold">
      {(label || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function AssignProgram({teacher, isOpen, onClose}: AssignProgramProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "exams">("courses");
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const teacherId = teacher?.id;
  const {data: detail} = useTeacherDetail(isOpen ? teacherId : undefined);
  const {data: searchResults, isFetching: isSearching} = useSearchPrograms(
    isSearchOpen ? debouncedQuery : "",
  );
  const assignMutation = useAssignProgram(teacherId);
  const unassignMutation = useUnassignProgram(teacherId);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !teacher) return null;

  // Phone and location come from the teacher's detail record: the list the
  // table is built from doesn't include them.
  const phone = detail?.phone || (teacher.phone ? String(teacher.phone) : "");
  const location = detail?.location || teacher.location || "";

  const assignedPrograms = detail?.programs ?? [];
  const activeList = assignedPrograms.filter((p) =>
    activeTab === "courses" ? p.program_type === "course" : p.program_type === "exam",
  );

  const assignedIds = new Set(assignedPrograms.map((p) => p.program_id));
  const searchType = activeTab === "courses" ? "course" : "exam";
  const availableItems = (searchResults ?? []).filter(
    (item) => item.program_type === searchType && !assignedIds.has(item.program_id),
  );

  const handleAssign = (programId: string) => {
    assignMutation.mutate(programId, {
      onSuccess: () => showSuccess("Program assigned"),
      onError: (error) => showError(extractApiError(error, "Couldn't assign this program")),
    });
  };

  const handleUnassign = (program: TeacherProgram) => {
    unassignMutation.mutate(program.program_id, {
      onSuccess: () => showSuccess("Program unassigned"),
      onError: (error) => showError(extractApiError(error, "Couldn't unassign this program")),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && teacher ? (
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
                  Assign Program
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
                  <TeacherAvatar
                    name={teacher.name}
                    avatar={teacher.avatar}
                    className="w-28 h-28 rounded-full border-2 border-white/80"
                    textClassName="text-2xl"
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
                    {/* No invented fallbacks: an admin reading a made-up
                        email or phone number would take it as real. */}
                    <span>{teacher.email || "No email on file"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon
                      icon="lucide:phone"
                      size={14}
                      className="text-gray-400"
                    />
                    {phone ? (
                      <>
                        <span>
                          {isPhoneRevealed ? phone : `${phone.slice(0, 4)} *** ****`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsPhoneRevealed((prev) => !prev)}
                          className="ml-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200 transition"
                        >
                          {isPhoneRevealed ? "Hide" : "Reveal"}
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">No phone on file</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon icon="circle-flags:ng" size={14} />
                    <span className="font-medium text-gray-700">
                      {location || "Location not set"}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 my-1" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Assigned Programs List
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
                  {activeList.length === 0 && (
                    <p className="text-xs text-gray-400 py-1">
                      No {activeTab === "courses" ? "courses" : "exam programs"} assigned yet.
                    </p>
                  )}
                  {activeList.map((item) => (
                    <div
                      key={item.program_id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ThumbnailFor label={item.program_name} />
                        <div className="truncate">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {item.program_name}
                          </h4>
                          {item.students_count > 0 && (
                            <p className="text-gray-400 text-[11px]">
                              {item.students_count} student{item.students_count === 1 ? "" : "s"}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnassign(item)}
                        disabled={unassignMutation.isPending}
                        className="flex items-center gap-1 text-red-500 font-medium hover:text-red-600 transition flex-shrink-0 disabled:opacity-50"
                      >
                        <span>Unassign</span>
                        <Icon icon="lucide:x" size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative pt-2">
                  {!isSearchOpen ? (
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition"
                    >
                      <span>
                        Assign more{" "}
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
                          placeholder="Search for programs to assign"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full border-none outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {!searchQuery.trim() ? (
                          <p className="text-center text-xs text-gray-400 py-2">
                            Start typing to search
                          </p>
                        ) : isSearching ? (
                          <p className="text-center text-xs text-gray-400 py-2">
                            Searching…
                          </p>
                        ) : availableItems.length > 0 ? (
                          availableItems.map((item) => (
                            <div
                              key={item.program_id}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <ThumbnailFor label={item.program_name} />
                                <div className="truncate">
                                  <h5 className="font-semibold text-gray-800 text-[11px] truncate">
                                    {item.program_name}
                                  </h5>
                                  {item.teacher_id && (
                                    <p className="text-gray-400 text-[10px]">
                                      Already has a teacher
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAssign(item.program_id)}
                                disabled={assignMutation.isPending}
                                className="flex items-center gap-1 text-gray-600 font-medium hover:text-purple-600 transition flex-shrink-0 disabled:opacity-50"
                              >
                                <span>Assign</span>
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
