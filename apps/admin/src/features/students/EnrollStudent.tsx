import React, {useState, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";

// Custom Iconify Component signature
interface IconProps {
  icon: string;
  size?: number;
  className?: string;
}

const Icon = ({icon, size = 16, className = ""}: IconProps) => (
  <span className={className} style={{fontSize: `${size}px`}}>
    {/* Your internal @mcc/ui Iconify renderer */}
  </span>
);

interface Student {
  id?: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  location: string;
  avatar: string;
}

interface ProgramItem {
  id: string;
  title: string;
  subtitle: string;
  levelIcon?: string;
  image: string;
  type: "course" | "exam";
}

interface EnrollStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

// Sample mock pool for available items to enroll
const MOCK_AVAILABLE_PROGRAMS: ProgramItem[] = [
  {
    id: "c1",
    title: "Pilates Teacher Training Certification 20 CPD Points",
    subtitle: "Moderate level.",
    levelIcon: "ph:pie-chart-duotone",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&q=80",
    type: "course",
  },
  {
    id: "c2",
    title: "Pilates Teacher Training Certification 20 CPD Points",
    subtitle: "Advanced level.",
    levelIcon: "ph:record-fill",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=100&q=80",
    type: "course",
  },
  {
    id: "c3",
    title: "Fashion Design & its business",
    subtitle: "Beginner level.",
    levelIcon: "ph:clock-duotone",
    image:
      "https://images.unsplash.com/photo-1537832816519-689ad163238b?w=100&q=80",
    type: "course",
  },
  {
    id: "e1",
    title: "West African Examination Council - WAEC",
    subtitle: "English, Maths, Physics & 3 more...",
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&q=80",
    type: "exam",
  },
  {
    id: "e2",
    title: "West African Examination Council - WAEC",
    subtitle: "English, Maths, Physics & 3 more...",
    image:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&q=80",
    type: "exam",
  },
];

export default function EnrollStudentModal({
  student,
  isOpen,
  onClose,
}: EnrollStudentModalProps) {
  const [activeTab, setActiveTab] = useState<"courses" | "exams">("courses");
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Track enrolled items
  const [enrolledCourses, setEnrolledCourses] = useState<ProgramItem[]>([
    MOCK_AVAILABLE_PROGRAMS[0],
    MOCK_AVAILABLE_PROGRAMS[0],
  ]);

  const [enrolledExams, setEnrolledExams] = useState<ProgramItem[]>([
    MOCK_AVAILABLE_PROGRAMS[3],
    MOCK_AVAILABLE_PROGRAMS[4],
  ]);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  // Handlers
  const handleUnenrollCourse = (indexToRemove: number) => {
    setEnrolledCourses((prev) =>
      prev.filter((_, idx) => idx !== indexToRemove),
    );
  };

  const handleUnenrollExam = (indexToRemove: number) => {
    setEnrolledExams((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEnrollItem = (item: ProgramItem) => {
    if (item.type === "course") {
      setEnrolledCourses((prev) => [...prev, item]);
    } else {
      setEnrolledExams((prev) => [...prev, item]);
    }
  };

  const activeList = activeTab === "courses" ? enrolledCourses : enrolledExams;

  // Available items for search popover based on active tab
  const availableItems = MOCK_AVAILABLE_PROGRAMS.filter(
    (item) => item.type === (activeTab === "courses" ? "course" : "exam"),
  ).filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          />

          {/* Slide-over Panel */}
          <motion.section
            initial={{x: "100%", opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: "100%", opacity: 0}}
            transition={{type: "tween", duration: 0.3}}
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-[580px] bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
          >
            <div className="flex flex-col gap-5">
              {/* Header */}
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

              {/* Top Avatar Banner */}
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

                <button
                  type="button"
                  className="relative z-10 mt-2 text-white/90 text-xs font-medium flex items-center gap-1.5 hover:text-white transition"
                >
                  <Icon icon="lucide:refresh-cw" size={12} />
                  <span>Replace photo</span>
                </button>
              </div>

              {/* Personal Details Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Personal Details
                </h3>

                <div className="grid grid-cols-2 gap-y-2.5 text-xs text-gray-600">
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="lucide:mail"
                      size={14}
                      className="text-gray-400"
                    />
                    <span>{student.email || "bright@gmail.com"}</span>
                  </div>

                  {/* Phone with Reveal Toggle */}
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

                  {/* Username */}
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="lucide:user"
                      size={14}
                      className="text-gray-400"
                    />
                    <span>{student.username || "mac"}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <Icon icon="circle-flags:ng" size={14} />
                    <span className="font-medium text-gray-700">
                      {student.location || "Lagos, NG"}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 my-1" />

              {/* Enrollment List Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Enrollment List
                </h3>

                {/* Pill Switcher */}
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

                {/* Currently Enrolled List */}
                <div className="space-y-3">
                  {activeList.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {item.title}
                          </h4>
                          <p className="flex items-center gap-1 text-gray-400 text-[11px]">
                            {item.levelIcon && (
                              <Icon
                                icon={item.levelIcon}
                                size={12}
                                className="text-purple-500"
                              />
                            )}
                            <span>{item.subtitle}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          activeTab === "courses"
                            ? handleUnenrollCourse(index)
                            : handleUnenrollExam(index)
                        }
                        className="flex items-center gap-1 text-red-500 font-medium hover:text-red-600 transition flex-shrink-0"
                      >
                        <span>Unenroll</span>
                        <Icon icon="lucide:x" size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Search Box / Dropdown Drawer Trigger */}
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
                    /* Search Dropdown Drawer (Image 2 style) */
                    <motion.div
                      initial={{opacity: 0, y: -6}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -6}}
                      className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg space-y-3"
                    >
                      {/* Search Input */}
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

                      {/* Available Results List */}
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {availableItems.length > 0 ? (
                          availableItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                                />
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
                                onClick={() => handleEnrollItem(item)}
                                className="flex items-center gap-1 text-gray-600 font-medium hover:text-purple-600 transition flex-shrink-0"
                              >
                                <span>Enroll</span>
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

                      {/* Inline Close Button */}
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

            {/* Bottom Submit Button */}
            <div className="pt-6">
              <button
                type="button"
                className={`w-full py-3 px-4 font-medium text-xs rounded-full transition duration-200 ${
                  isSearchOpen || activeList.length > 0
                    ? "bg-purple-600 text-white shadow-md hover:bg-purple-700"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                Update Enrollment
              </button>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
