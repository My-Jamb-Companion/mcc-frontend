"use client";

import {FORMAT_BLURBS, type ApiFormatOffer, type LiveFormat} from "@/src/features/courses/helper/liveFormats";

interface FormatPickerProps {
  formats: ApiFormatOffer[];
  selected: LiveFormat | null;
  onSelect: (format: LiveFormat) => void;
}

const formatPrice = (price: number | string) => `₦${Number(price).toLocaleString()}`;

/**
 * Lets a buyer choose, at signup, whether to learn self-paced, in a live group of five, or one-to-one
 * (docs/pricing-model.md). Live teaching is optional: self-paced is the entry price. Renders nothing when a
 * program is sold in one format or none, since there's nothing to choose.
 */
export function FormatPicker({formats, selected, onSelect}: FormatPickerProps) {
  if (formats.length < 2) return null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold mb-1">How do you want to learn?</legend>
      {formats.map((f) => {
        // "From" the cheapest tier, so the card reads the same whichever tier is picked below.
        const cheapest = Math.min(...f.tier_prices.map((t) => Number(t.price)));
        return (
          <label
            key={f.format}
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              selected === f.format ? "border-primary bg-primary/5" : "border-muted/30 hover:border-muted/60"
            }`}
          >
            <span className="flex items-start gap-2">
              <input
                type="radio"
                name="live-format"
                value={f.format}
                checked={selected === f.format}
                onChange={() => onSelect(f.format)}
                className="mt-1 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium">{f.label}</span>
                <span className="block text-xs text-subtle">{FORMAT_BLURBS[f.format]}</span>
              </span>
            </span>
            {Number.isFinite(cheapest) && <span className="text-sm font-semibold whitespace-nowrap">from {formatPrice(cheapest)}</span>}
          </label>
        );
      })}
    </fieldset>
  );
}
