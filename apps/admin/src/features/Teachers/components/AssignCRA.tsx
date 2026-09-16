import {Icon, Modal} from "@mcc/ui";
import {useEffect, useState, useRef} from "react";
import {Teacher} from "../types/types";
import {EscalatedAssignment} from "../services/escalatedAssignments.service";

const WEEKDAY_NAMES = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatSlot(assignment: EscalatedAssignment): string | null {
  if (!assignment.weekly_day_of_week || !assignment.weekly_start_time) return null;
  return `${WEEKDAY_NAMES[assignment.weekly_day_of_week]}s, ${assignment.weekly_start_time}`;
}

export interface AssignCRAModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: EscalatedAssignment[];
  teacher: Teacher;
  onAssign: (assignmentId: string) => void;
  isAssigning?: boolean;
}

export default function AssignCRAModal({
  isOpen,
  onClose,
  assignments,
  teacher,
  onAssign,
  isAssigning = false,
}: AssignCRAModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The modal stays mounted the whole time (Teachers.tsx always renders
    // it, just toggling `isOpen`), so its selection state doesn't reset on
    // its own when reopened for a different teacher -- this effect is the
    // reset, not avoidable via unmounting.
    if (isOpen) {
      setSelectedId(undefined);
      setOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const selected = assignments.find((a) => a.assignment_id === selectedId) ?? null;

  function handleAssign() {
    if (!selected || isAssigning) return;
    onAssign(selected.assignment_id);
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">
            Assign to escalated student
          </h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <Icon icon="mdi:close" size={20} />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-neutral-900">
              {teacher.name}
            </p>
            <p className="text-sm text-neutral-500">{teacher.email}</p>
          </div>
        </div>

        <p className="mt-6 text-base font-semibold text-neutral-900">
          Who needs {teacher.name.split(" ")[0]} as their teacher?
        </p>
        <p className="text-xs text-neutral-500">
          Students whose onboarding call found no available{" "}
          {teacher.subject ? `${teacher.subject} ` : ""}teacher for their requested time.
        </p>

        {assignments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-neutral-200 px-4 py-6 text-center">
            <p className="text-sm text-neutral-500">
              No escalated students currently need
              {teacher.subject ? ` a ${teacher.subject}` : ""} teacher.
            </p>
          </div>
        ) : (
          <div ref={dropdownRef} className="relative mt-3">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-left"
            >
              <span
                className={selected ? "text-sm text-neutral-900" : "text-sm text-neutral-400"}
              >
                {selected
                  ? selected.student_name || selected.student_email
                  : "Select student"}
              </span>
              <Icon
                icon="mdi:chevron-down"
                size={20}
                className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                {assignments.map((assignment) => {
                  const isSelected = assignment.assignment_id === selectedId;
                  const slot = formatSlot(assignment);
                  return (
                    <button
                      key={assignment.assignment_id}
                      type="button"
                      onClick={() => {
                        setSelectedId(assignment.assignment_id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected ? "bg-neutral-100" : "bg-white hover:bg-neutral-50"
                      }`}
                    >
                      <div className="h-9 w-9 shrink-0 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-semibold">
                        {(assignment.student_name || assignment.student_email)
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-neutral-900 truncate">
                          {assignment.student_name || assignment.student_email}
                        </span>
                        <span className="block text-xs text-neutral-500 truncate">
                          {assignment.subject_name ?? "No subject"}
                          {slot ? ` · ${slot}` : ""}
                        </span>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected ? "border-violet-600" : "border-neutral-300"
                        }`}
                      >
                        {isSelected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-2xl border border-gray-500 py-3 text-sm font-semibold text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selected || isAssigning}
            className="mt-6 w-full rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
