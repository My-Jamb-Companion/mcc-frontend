import {useEffect, useRef, useState} from "react";
import {Icon} from "@mcc/ui";
import {useExam} from "./context/ExamContext";
import {ExamSubject} from "@/src/features/constants/demoExams";

interface SubjectSelectorProps {
  subjects?: ExamSubject[];
  onChange?: (selectedIds: string[]) => void;
  showOnlySelected?: boolean;
  currency?: string;
  onAccess?: () => void;
}

export default function SubjectSelector({
  subjects = [],
  onChange,
  showOnlySelected = false,
  currency = "$",
  onAccess,
}: SubjectSelectorProps) {
  const examContext = useExam();
  const [selectedLocal, setSelectedLocal] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selected = examContext
    ? new Set(examContext.selectedSubjectIds)
    : selectedLocal;

  const subjectsToRender = showOnlySelected
    ? subjects.filter((s) => selected.has(s.id) && !s.isEnrolled)
    : subjects;

  const allSelected =
    subjectsToRender.length > 0 && selected.size === subjectsToRender.length;
  const isIndeterminate = selected.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const emit = (next: Set<string>) => {
    const nextArr = Array.from(next);
    if (examContext) {
      examContext.setSelectedSubjectIds(nextArr);
    } else {
      setSelectedLocal(next);
    }
    onChange?.(nextArr);
  };

  const toggleSubject = (id: string) => {
    const subject = subjects.find((s) => s.id === id);
    if (subject?.isEnrolled) return; // enrolled subjects can't be toggled

    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    emit(next);
  };

  const enrolledIds = new Set(
    subjects.filter((s) => s.isEnrolled).map((s) => s.id),
  );

  const toggleSelectAll = () => {
    // When deselecting all, keep enrolled subjects checked
    if (selected.size > 0) {
      emit(enrolledIds);
    } else {
      emit(new Set(subjects.map((s) => s.id)));
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {showOnlySelected ? (
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">
            Selected Subjects
          </p>
        ) : (
          <>
            <p className="text-xs font-medium tracking-wide text-subtle uppercase">
              Select preferred subject
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              Select at least one subject
            </h2>
          </>
        )}
      </div>

      {!showOnlySelected && (
        <label className="flex items-center gap-3 cursor-pointer w-fit select-none">
          <span className="relative flex items-center justify-center shrink-0">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="peer sr-only"
              aria-label="Select all subjects"
            />
            <span
              className={`w-5 h-5 rounded-md border transition-colors flex items-center justify-center ${
                allSelected || isIndeterminate
                  ? "bg-primary border-primary"
                  : "border-muted/30"
              }`}
            >
              {allSelected && (
                <Icon icon="line-md:confirm" className="text-white" size={14} />
              )}
              {isIndeterminate && (
                <Icon icon="ic:round-minus" className="text-white" size={14} />
              )}
            </span>
          </span>
          <span className="text-sm font-medium text-foreground">
            Select all
          </span>
        </label>
      )}

      <div className="flex flex-col gap-6 pt-2">
        {subjectsToRender.length === 0 ? (
          <p className="text-sm text-subtle italic">No subjects selected.</p>
        ) : (
          subjectsToRender.map((subject) => {
            const isChecked = selected.has(subject.id);
            const CardComponent = showOnlySelected ? "div" : "label";
            return (
              <div key={subject.id} className="relative">
                {!showOnlySelected && (
                  <div className="w-fit z-10 rounded-t-lg ml-auto mr-6 bg-primary-gradient px-3 py-1 shadow-sm">
                    <span className="text-[11px] font-medium text-white whitespace-nowrap">
                      {subject.opening}
                    </span>
                  </div>
                )}

                <CardComponent
                  htmlFor={showOnlySelected ? undefined : subject.id}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 pr-6 transition-colors ${
                    showOnlySelected
                      ? "border-primary/50 bg-primary/5 cursor-default"
                      : isChecked
                        ? "border-primary/50 bg-primary/5 cursor-pointer"
                        : "border-muted/20 hover:border-muted/40 cursor-pointer"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {!showOnlySelected && (
                      <span className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input
                          id={subject.id}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubject(subject.id)}
                          className="peer sr-only"
                        />
                        <span className="w-5 h-5 rounded-md border border-muted/30 peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                          {isChecked && (
                            <Icon
                              icon="line-md:confirm"
                              className="text-white"
                              size={14}
                            />
                          )}
                        </span>
                      </span>
                    )}

                    <div className="min-w-0 flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-foreground">
                        {subject.name}
                      </p>
                      <p className="text-xs text-subtle leading-relaxed">
                        {subject.description}
                      </p>
                    </div>
                  </div>

                  {subject.isEnrolled ? (
                    <button
                      onClick={onAccess}
                      className="flex items-center gap-3 border border-muted/30 rounded-full max-md:text-xs px-2 md:px-2.5 md:py-1.5 py-1 font-medium cursor-pointer shadow-sm"
                    >
                      <span>Access</span>
                      <Icon icon="grommet-icons:next" size={12} />
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-base font-semibold text-foreground whitespace-nowrap">
                        {currency}
                        {subject.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1">
                        <Icon
                          icon="mdi:diamond-stone"
                          className="text-sky-400"
                          size={13}
                        />
                        <span className="text-xs text-subtle">
                          {subject.diamonds} Diamonds
                        </span>
                      </div>
                    </div>
                  )}
                </CardComponent>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
