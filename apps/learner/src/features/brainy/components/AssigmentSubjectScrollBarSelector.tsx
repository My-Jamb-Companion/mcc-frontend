"use client";

import {useCallback, useRef, useState} from "react";

import {Icon} from "@mcc/ui";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SubjectOption {
  id: string;
  label: string;
  icon: string;
}

export interface SubjectSelectorProps {
  eyebrow?: string;
  heading?: string;
  subjects?: SubjectOption[];
  /** Controlled selected subject id. If omitted, component manages its own state. */
  selectedId?: string;
  defaultSelectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

const DEFAULT_SUBJECTS: SubjectOption[] = [
  {id: "psychology", label: "Psychology", icon: "ph:brain"},
  {id: "physics", label: "Physics", icon: "ph:atom"},
  {id: "biology", label: "Biology", icon: "ph:leaf"},
  {id: "math", label: "Math", icon: "ph:calculator"},
  {id: "general", label: "General", icon: "ph:smiley"},
  {id: "language", label: "Language", icon: "ph:translate"},
  {id: "chemistry", label: "Chemistry", icon: "ph:flask"},
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function AssignmentSubjectSelector({
  eyebrow = "Assignment",
  heading = "What do you want to solve?",
  subjects = DEFAULT_SUBJECTS,
  selectedId,
  defaultSelectedId = "general",
  onSelect,
  className = "",
}: SubjectSelectorProps) {
  const isControlled = selectedId !== undefined;
  const [internalSelected, setInternalSelected] = useState(defaultSelectedId);
  const active = isControlled ? selectedId : internalSelected;

  const scrollRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleSelect = useCallback(
    (id: string) => {
      if (!isControlled) setInternalSelected(id);
      onSelect?.(id);

      // Bring the newly selected pill fully into view if it's clipped.
      const el = pillRefs.current.get(id);
      el?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    },
    [isControlled, onSelect],
  );

  const scrollByPill = useCallback((direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const pills = Array.from(
      container.querySelectorAll<HTMLButtonElement>("[data-pill]"),
    );
    if (pills.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const epsilon = 4; // tolerance for sub-pixel rounding

    if (direction === "right") {
      // First pill whose right edge extends past the container's right edge.
      const next = pills.find(
        (p) => p.getBoundingClientRect().right > containerRect.right + epsilon,
      );
      next?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "end",
      });
    } else {
      // Last pill whose left edge is before the container's left edge.
      const candidates = pills.filter(
        (p) => p.getBoundingClientRect().left < containerRect.left - epsilon,
      );
      const prev = candidates[candidates.length - 1];
      prev?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, []);

  return (
    <div className={`mx-auto w-full max-w-[660px] text-center ${className}`}>
      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
        {eyebrow}
      </span>

      <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-[28px]">
        {heading}
      </h1>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByPill("left")}
          aria-label="Scroll subjects left"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Icon icon="ph:caret-left" className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex flex-1 gap-2 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {subjects.map((subject) => {
            const isActive = subject.id === active;
            return (
              <button
                key={subject.id}
                data-pill
                ref={(el) => {
                  if (el) pillRefs.current.set(subject.id, el);
                  else pillRefs.current.delete(subject.id);
                }}
                type="button"
                onClick={() => handleSelect(subject.id)}
                aria-pressed={isActive}
                className={[
                  "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-300 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                ].join(" ")}
              >
                <Icon
                  icon={subject.icon}
                  className={`h-3.5 w-3.5 ${isActive ? "text-blue-500" : "text-gray-400"}`}
                />
                {subject.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollByPill("right")}
          aria-label="Scroll subjects right"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Icon icon="ph:caret-right" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default AssignmentSubjectSelector;
