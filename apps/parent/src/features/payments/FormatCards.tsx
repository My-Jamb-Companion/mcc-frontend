"use client";

import { formatChoices, type CatalogueFormat, type LiveFormat } from "./formats";

interface FormatCardsProps {
  /** Keeps the radio groups of different programs on one screen from sharing a selection. */
  groupId: string;
  formats: CatalogueFormat[];
  value: LiveFormat | undefined;
  /** The default tier: every way is priced at it. */
  tierId?: string;
  onChange: (format: LiveFormat) => void;
}

const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

/**
 * How the child learns, and so what is paid. All three ways (self-paced, a live group of five, one-to-one) are
 * always listed with their price (the admin's default tier); one that is not on sale yet is shown but cannot be
 * chosen, and says so. Renders nothing for a
 * program with no published prices at all: its flat price is the only option.
 */
export function FormatCards({ groupId, formats, value, tierId, onChange }: FormatCardsProps) {
  if (formats.length < 1) return null;

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs font-medium text-muted mb-1">How does your child learn?</legend>
      {formatChoices(formats, tierId).map((choice) => (
        <label
          key={choice.format}
          className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 ${
            !choice.onSale
              ? "cursor-not-allowed border-muted/20 opacity-60"
              : value === choice.format
                ? "cursor-pointer border-primary bg-primary/5"
                : "cursor-pointer border-muted/20 hover:border-muted/40"
          }`}
        >
          <span className="flex items-start gap-2">
            <input
              type="radio"
              name={`format-${groupId}`}
              value={choice.format}
              checked={value === choice.format}
              disabled={!choice.onSale}
              onChange={() => choice.onSale && onChange(choice.format)}
              className="mt-0.5 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium">{choice.name}</span>
              <span className="block text-xs text-muted">{choice.blurb}</span>
            </span>
          </span>
          <span className="text-sm font-semibold whitespace-nowrap">
            {choice.onSale && choice.price !== null ? (
              formatPrice(choice.price)
            ) : (
              <span className="text-xs font-medium text-muted">Not available yet</span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
