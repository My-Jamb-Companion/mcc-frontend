"use client";

import {Icon} from "@mcc/ui";

export interface SelectOption {
  value: string;
  label: string;
}

interface DiscoveryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  level: string;
  onLevelChange: (value: string) => void;
  levelOptions: SelectOption[];
  /** e.g. "All categories" -- plural, not derived from a singular label, so
   * callers can get irregular plurals right (categories, not "categorys"). */
  secondaryAllLabel: string;
  secondaryValue: string;
  onSecondaryChange: (value: string) => void;
  secondaryOptions: SelectOption[];
}

/** Search + two selects, wired to real query-string filters on the
 * catalogue it's placed above -- reused for both courses (category) and
 * exam-prep programs (subject), which is why the second dropdown's label
 * and options are passed in rather than hardcoded. */
export default function DiscoveryFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  level,
  onLevelChange,
  levelOptions,
  secondaryAllLabel,
  secondaryValue,
  onSecondaryChange,
  secondaryOptions,
}: DiscoveryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-52">
        <Icon
          icon="ph:magnifying-glass"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-full border border-muted/30 bg-transparent py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <select
        value={secondaryValue}
        onChange={(e) => onSecondaryChange(e.target.value)}
        className="rounded-full border border-muted/30 bg-transparent py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">{secondaryAllLabel}</option>
        {secondaryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={level}
        onChange={(e) => onLevelChange(e.target.value)}
        className="rounded-full border border-muted/30 bg-transparent py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">All levels</option>
        {levelOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
