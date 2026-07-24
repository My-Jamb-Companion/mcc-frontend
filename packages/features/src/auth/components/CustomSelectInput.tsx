"use client";

import {AnimatePresence, Icon, motion} from "@mcc/ui";
import {useState, useRef, useEffect} from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  mode?: "options" | "date";
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  selectRadius?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  icon?: string;
  className?: string;
}

export function CustomSelect({
  mode = "options",
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  icon,
  selectRadius = "lg",
  className,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState(() =>
    value && mode === "date" ? fromISODate(value) : new Date(),
  );

  const selected = options?.find((o) => o.value === value);
  const today = new Date();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const triggerLabel =
    mode === "date"
      ? value
        ? formatDisplayDate(value)
        : placeholder
      : selected
        ? selected.label
        : placeholder;

  return (
    <div
      ref={ref}
      className={`relative w-full flex flex-col gap-4 ${error ? " border border-danger!" : ""}`}
    >
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm border rounded-${selectRadius} bg-white dark:bg-hint dark:border-0 dark:text-white outline-none focus:ring-2 ring-primary/50 focus:ring-primary/30
          ${open ? " border-zinc-300 shadow-md" : " border-zinc-200"}
          ${(mode === "date" ? value : selected) ? "text-zinc-900" : "text-zinc-400"}
          ${className}`}
        >
          <span className="flex items-center gap-2.5">
            {icon && <Icon icon={icon} size={16} className="text-zinc-400" />}
            {triggerLabel}
          </span>
          <Icon
            icon="line-md:chevron-up"
            size={15}
            className={`text-zinc-400 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
          />
        </button>
      </div>
      <AnimatePresence mode="wait">
        {open && (
          <motion.ul
            key="dropdown"
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 100}}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-white dark:bg-zinc-800 border border-hint/30  rounded-lg overflow-hidden shadow-lg absolute left-0 top-full mt-2 w-full z-20"
          >
            {options?.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-800 dark:text-white cursor-pointer transition-colors
                ${value === opt.value ? "bg-zinc-50 dark:bg-muted/70" : "hover:bg-zinc-50 dark:hover:bg-muted/80"}`}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
        {open && mode === "date" && (
          <motion.div
            key="calendar"
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 100}}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-white dark:bg-zinc-800 border border-hint/30 rounded-lg shadow-lg absolute left-0 top-full mt-2 w-72 z-20 p-3"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <button
                type="button"
                onClick={() =>
                  setViewDate(
                    (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
                  )
                }
                className="p-1 rounded-md hover:bg-zinc-50 dark:hover:bg-muted/80 text-zinc-500"
              >
                <Icon icon="line-md:chevron-left" size={16} />
              </button>
              <span className="text-sm font-medium text-zinc-800 dark:text-white">
                {viewDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                type="button"
                onClick={() =>
                  setViewDate(
                    (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
                  )
                }
                className="p-1 rounded-md hover:bg-zinc-50 dark:hover:bg-muted/80 text-zinc-500"
              >
                <Icon icon="line-md:chevron-right" size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
              {WEEKDAYS.map((wd) => (
                <span
                  key={wd}
                  className="text-xs text-zinc-400 dark:text-zinc-500 py-1"
                >
                  {wd}
                </span>
              ))}
              {getCalendarGrid(viewDate).map((day) => {
                const inMonth = day.getMonth() === viewDate.getMonth();
                const isSelected = value
                  ? isSameDay(day, fromISODate(value))
                  : false;
                const isToday = isSameDay(day, today);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => {
                      onChange?.(toISODate(day));
                      setOpen(false);
                    }}
                    className={`text-sm rounded-md py-1.5 transition-colors
                      ${inMonth ? "text-zinc-800 dark:text-white" : "text-zinc-300 dark:text-zinc-600"}
                      ${isSelected ? "bg-primary text-white" : "hover:bg-zinc-50 dark:hover:bg-muted/80"}
                      ${isToday && !isSelected ? "ring-1 ring-primary/40" : ""}`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(s: string): string {
  return fromISODate(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Returns a 42-cell grid of dates covering the full weeks that overlap the given month */
function getCalendarGrid(viewDate: Date): Date[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({length: 42}, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}
