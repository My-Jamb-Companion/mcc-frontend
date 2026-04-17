"use client";

import {Icon} from "@mcc/ui";
import {useState, useRef, useEffect} from "react";

export interface SelectOption {
  value: string;
  icon?: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm border bg-white transition-colors outline-none
          ${open ? "rounded-t-lg border-b-0 border-zinc-300" : "rounded-lg border-zinc-200"}
          ${selected ? "text-zinc-900" : "text-zinc-400"}`}
      >
        {selected ? (
          <span className="flex items-center gap-2.5">
            <span className="text-lg leading-none">{selected.icon}</span>
            {selected.label}
          </span>
        ) : (
          placeholder
        )}
        <Icon
          icon="line-md:chevron-up"
          width="15"
          height="15"
          className={`text-zinc-400 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
        />
      </button>

      {open && (
        <ul className="absolute top-full left-0 right-0 z-10 bg-white border border-t-0 border-zinc-200 rounded-b-lg overflow-hidden">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-800 cursor-pointer transition-colors
                ${value === opt.value ? "bg-zinc-50" : "hover:bg-zinc-50"}`}
            >
              <span className="text-lg leading-none w-5 text-center">
                {opt.icon}
              </span>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
