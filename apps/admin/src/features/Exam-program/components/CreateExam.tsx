import {useState, useRef, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Icon, Modal} from "@mcc/ui";

type ExamOption = {
  id: string;
  label: string;
  emoji: string;
  swatch: string; // tailwind bg class for the icon chip
};

const EXAM_OPTIONS: ExamOption[] = [
  {
    id: "jamb",
    label: "Joint Admission Matriculation Board (JAMB)",
    emoji: "🌱",
    swatch: "bg-emerald-100",
  },
  {
    id: "waec",
    label: "West African Examination Council (WAEC)",
    emoji: "🛡️",
    swatch: "bg-amber-100",
  },
  {
    id: "neco",
    label: "National Examination Council",
    emoji: "🏫",
    swatch: "bg-sky-100",
  },
];

const DIFFICULTY_OPTIONS = [
  {label: "Beginner", icon: "hugeicons:progress-02"},
  {label: "Moderate", icon: "hugeicons:progress-03"},
  {label: "Advanced", icon: "ri:progress-8-line"},
];

const SUGGESTED_TAGS = [
  "Exam program",
  "Exam",
  "School leaving",
  "New language",
  "Community service",
];

type ExamType = "new" | "existing";

export default function CreateExamProgram({
  open = true,
  onClose,
  onCreate,
}: {
  open?: boolean;
  onClose?: () => void;
  onCreate?: (payload: unknown) => void;
}) {
  const [examType, setExamType] = useState<ExamType>("new");
  const [examOpen, setExamOpen] = useState(false);
  const [exam, setExam] = useState<ExamOption | null>(null);

  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_OPTIONS[0]);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  //   const [mobile, setMobile] = useState(true);
  //   const [tv, setTv] = useState(false);

  const examRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (examRef.current && !examRef.current.contains(e.target as Node))
        setExamOpen(false);
      if (
        difficultyRef.current &&
        !difficultyRef.current.contains(e.target as Node)
      )
        setDifficultyOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || tags.includes(clean)) return;
    setTags((t) => [...t, clean]);
    setTagInput("");
  }
  function removeTag(tag: string) {
    setTags((t) => t.filter((x) => x !== tag));
  }

  const canCreate = Boolean(exam);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900">
        Create new exam program
      </h2>

      {/* Segmented control */}
      <div className="mt-4 inline-flex rounded-full bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setExamType("new")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            examType === "new"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400"
          }`}
        >
          New exam
        </button>
        <button
          type="button"
          onClick={() => setExamType("existing")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            examType === "existing"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-400"
          }`}
        >
          Existing exam
        </button>
      </div>

      {/* Exam name */}
      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-900">
          Exam name
        </label>
        <div className="relative" ref={examRef}>
          <button
            type="button"
            onClick={() => setExamOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-3.5 py-2.5 text-left text-sm hover:border-gray-300"
          >
            {exam ? (
              <span className="flex items-center gap-2 text-gray-900">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${exam.swatch}`}
                >
                  {exam.emoji}
                </span>
                {exam.label}
              </span>
            ) : (
              <span className="text-gray-400">Select exam</span>
            )}
            <span className="flex items-center gap-2">
              <Icon
                icon="line-md:chevron-down"
                className={`h-4 w-4 text-gray-400 transition-transform ${examOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>

          <AnimatePresence>
            {examOpen && (
              <motion.ul
                initial={{opacity: 0, y: -4}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -4}}
                transition={{duration: 0.15}}
                className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
              >
                {EXAM_OPTIONS.map((opt) => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setExam(opt);
                        setExamOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${opt.swatch}`}
                      >
                        {opt.emoji}
                      </span>
                      {opt.label}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Difficulty level - only appears once an exam is chosen */}
      <AnimatePresence initial={false}>
        {exam && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2}}
            // className="overflow-hidden"
          >
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                Difficulty Level
              </label>
              <div className="relative" ref={difficultyRef}>
                <button
                  type="button"
                  onClick={() => setDifficultyOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-3.5 py-2.5 text-left text-sm text-gray-900 hover:border-gray-300"
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      icon={difficulty.icon}
                      size={16}
                      className={
                        difficulty.label === "Beginner"
                          ? "text-[#F27313]"
                          : difficulty.label === "Moderate"
                            ? "text-blue-500"
                            : "text-[#FF0000]"
                      }
                    />
                    {difficulty.label}
                  </span>
                  <Icon
                    icon="line-md:chevron-down"
                    className={`h-4 w-4 text-gray-400 transition-transform ${difficultyOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {difficultyOpen && (
                    <motion.ul
                      initial={{opacity: 0, y: -4}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -4}}
                      transition={{duration: 0.15}}
                      className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                    >
                      {DIFFICULTY_OPTIONS.map((d) => (
                        <li key={d.label}>
                          <button
                            type="button"
                            onClick={() => {
                              setDifficulty(d);
                              setDifficultyOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50"
                          >
                            <Icon
                              icon={d.icon}
                              size={16}
                              className={
                                d.label === "Beginner"
                                  ? "text-[#F27313]"
                                  : d.label === "Moderate"
                                    ? "text-blue-500"
                                    : "text-[#FF0000]"
                              }
                            />
                            {d.label}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags */}
      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-900">
          Tags
        </label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-gray-300">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
              >
                <Icon
                  icon="material-symbols:close-rounded"
                  className="h-3 w-3 text-gray-500"
                />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder={tags.length ? "" : "Add tag"}
            className="min-w-[80px] flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          <span className="font-medium text-gray-400">Suggested: </span>
          {SUGGESTED_TAGS.map((t, i) => (
            <span key={t}>
              <button
                type="button"
                onClick={() => addTag(t)}
                className="hover:text-gray-600 hover:underline"
              >
                {t}
              </button>
              {i < SUGGESTED_TAGS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>

      {/* Availability
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gray-900">Availability</h3>
        <div className="mt-2 flex items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={mobile}
              onChange={(e) => setMobile(e.target.checked)}
              className="h-4 w-4 rounded accent-violet-600"
            />
            Mobile
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={tv}
              onChange={(e) => setTv(e.target.checked)}
              className="h-4 w-4 rounded accent-violet-600"
            />
            TV
          </label>
        </div>
      </div> */}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canCreate}
          onClick={() =>
            onCreate?.({
              examType,
              exam: exam?.id,
              difficulty,
              tags,
              //   availability: {mobile, tv},
            })
          }
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
            canCreate
              ? "bg-violet-600 text-white hover:bg-violet-700"
              : "cursor-not-allowed bg-gray-100 text-gray-400"
          }`}
        >
          Create program
        </button>
      </div>
    </Modal>
  );
}
