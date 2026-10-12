"use client";

import { FORMAT_NAMES, type CatalogueFormat, type LiveFormat } from "./formats";

interface FormatSelectProps {
  formats: CatalogueFormat[];
  value: LiveFormat | undefined;
  onChange: (format: LiveFormat) => void;
}

/**
 * Lets a parent choose whether their child learns self-paced, in a live group of five, or one-to-one. Live
 * teaching is optional. Renders nothing when a program is sold one way, since there's nothing to choose.
 */
export function FormatSelect({ formats, value, onChange }: FormatSelectProps) {
  if (formats.length < 2) return null;

  return (
    <select
      aria-label="How your child learns"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value as LiveFormat)}
      className="rounded-lg border border-muted/20 bg-transparent px-2 py-1 text-xs"
    >
      {formats.map((f) => (
        <option key={f.format} value={f.format}>
          {FORMAT_NAMES[f.format]}
        </option>
      ))}
    </select>
  );
}
