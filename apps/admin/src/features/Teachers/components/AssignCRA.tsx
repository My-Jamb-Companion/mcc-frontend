import {Icon, Modal} from "@mcc/ui";
import {useState, useEffect, useRef} from "react";
import {Teacher} from "../types/types";

export interface CraStudent {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AssignCRAModalProps {
  isOpen: boolean;

  onClose: () => void;

  students: CraStudent[];

  teacher: Teacher;

  onAssign: (studentId: string) => void;

  isAssigning?: boolean;
}

export default function AssignCRAModal({
  isOpen,
  onClose,
  students,
  teacher,
  onAssign,
  isAssigning = false,
}: AssignCRAModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const selectedStudent = students.find((s) => s.id === selectedId) ?? null;

  function handleAssign() {
    if (!selectedStudent || isAssigning) return;
    onAssign(selectedStudent.id);
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Assign CRA</h1>
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
          Who are you assigning to {teacher.name.split(" ")[0]}?
        </p>

        <div ref={dropdownRef} className="relative mt-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-left"
          >
            <span
              className={
                selectedStudent
                  ? "text-sm text-neutral-900"
                  : "text-sm text-neutral-400"
              }
            >
              {selectedStudent ? selectedStudent.name : "Select student"}
            </span>
            <Icon
              icon="mdi:chevron-down"
              size={20}
              className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
              {students.map((student) => {
                const isSelected = student.id === selectedId;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(student.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "bg-neutral-100"
                        : "bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <span className="flex-1 text-sm font-medium text-neutral-900">
                      {student.name}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
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
            disabled={!selectedStudent || isAssigning}
            className="mt-6 w-full rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
