"use client";

import {formatChoices, type ApiFormatOffer, type LiveFormat} from "@/src/features/courses/helper/liveFormats";

interface FormatPickerProps {
  formats: ApiFormatOffer[];
  selected: LiveFormat | null;
  onSelect: (format: LiveFormat) => void;
}

const formatPrice = (price: number | string) => `₦${Number(price).toLocaleString()}`;

/**
 * Step one of the price: how the buyer wants to learn. All three ways (self-paced, a live group of five, one-to-one)
 * are always listed; one that is not on sale yet is shown but cannot be chosen, and says so. The tier prices below
 * are those of the chosen way. Renders nothing for a program with no published prices at all: its flat price is
 * the only option (docs/pricing-model.md).
 */
export function FormatPicker({formats, selected, onSelect}: FormatPickerProps) {
  if (formats.length < 1) return null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold mb-1">1. How do you want to learn?</legend>
      {formatChoices(formats).map((choice) => (
        <label
          key={choice.format}
          className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
            !choice.onSale
              ? "cursor-not-allowed border-muted/20 opacity-60"
              : selected === choice.format
                ? "cursor-pointer border-primary bg-primary/5"
                : "cursor-pointer border-muted/30 hover:border-muted/60"
          }`}
        >
          <span className="flex items-start gap-2">
            <input
              type="radio"
              name="live-format"
              value={choice.format}
              checked={selected === choice.format}
              disabled={!choice.onSale}
              onChange={() => choice.onSale && onSelect(choice.format)}
              className="mt-1 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium">{choice.label}</span>
              <span className="block text-xs text-subtle">{choice.blurb}</span>
            </span>
          </span>
          <span className="text-sm font-semibold whitespace-nowrap">
            {choice.onSale && choice.fromPrice !== null ? (
              `from ${formatPrice(choice.fromPrice)}`
            ) : (
              <span className="text-xs font-medium text-subtle">Not available yet</span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
