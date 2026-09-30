import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Button, Icon} from "@mcc/ui";
import {useExamPrograms} from "../hooks/useExamPrograms";
import {ProgramListRowData} from "./ProgramRow";

function statusLabel(status: ProgramListRowData["status"]) {
  return status === "live" ? "Published" : "Draft";
}

function ProgramSiblingRow({
  program,
  expanded,
  onToggle,
  onView,
}: {
  program: ProgramListRowData;
  expanded: boolean;
  onToggle: () => void;
  onView?: (id: string) => void;
}) {
  const open = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onView?.(program.id);
  };

  return (
    <div className="relative pt-3">
      <div
        className={`w-fit ml-auto mr-6 rounded-t-lg px-4 py-1.5 text-xs font-semibold text-white shadow-md ${
          program.status === "live"
            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
            : "bg-gradient-to-r from-gray-400 to-gray-500"
        }`}
      >
        {statusLabel(program.status)}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-colors hover:border-gray-200"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {program.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {program.teacherName || "Unassigned"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xl font-bold text-gray-900">
              {program.currency}
              {new Intl.NumberFormat("en-US").format(program.price)}
            </span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{height: 0, opacity: 0}}
              animate={{height: "auto", opacity: 1}}
              exit={{height: 0, opacity: 0}}
              transition={{duration: 0.2}}
              className="overflow-hidden"
            >
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                <Icon icon="solar:star-bold" size={14} className="text-amber-400" />
                {program.rating}
                <span className="text-gray-400"> • </span>
                {program.tags.join(", ") || "Uncategorized"}
              </div>

              <Button
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onView?.(program.id);
                  }
                }}
                radius="sm"
                width="fit"
                className="mt-3"
                rightIcon={<Icon icon="ri:arrow-right-s-line" size={18} />}
              >
                View program
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

/**
 * Other programs under the same exam (e.g. the other JAMB subjects) --
 * replaces a component that used to render 5 hardcoded fake courses with
 * two invented instructors regardless of which program was actually open.
 * Renders nothing when the program has no exam_id (an internal/uncategorized
 * program has no siblings to speak of) or the exam has only this one
 * program.
 */
export default function ProgramSiblingsGrid({
  examId,
  currentProgramId,
  onView,
}: {
  examId?: string;
  currentProgramId: string;
  onView?: (id: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const {programs, isLoading} = useExamPrograms(
    examId ? {exam_id: examId, status: "published", limit: 10} : undefined,
  );

  if (!examId) return null;

  const siblings = programs.filter((p) => p.id !== currentProgramId);

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading other programs…</p>;
  }

  if (siblings.length === 0) return null;

  return (
    <div className="w-full">
      <p className="mb-3 text-sm font-semibold text-gray-500">
        Other programs for this exam
      </p>
      <div className="flex flex-col gap-6">
        {siblings.map((program) => (
          <ProgramSiblingRow
            key={program.id}
            program={program}
            expanded={expandedId === program.id}
            onToggle={() =>
              setExpandedId((id) => (id === program.id ? null : program.id))
            }
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
}
