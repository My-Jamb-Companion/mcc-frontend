"use client";

import type { CatalogueTierPrice } from "./payments.service";

interface TierCardsProps {
  /** Keeps the radio groups of different programs on one screen from sharing a selection. */
  groupId: string;
  tiers: CatalogueTierPrice[];
  value: string | null;
  onChange: (tierId: string) => void;
  /** The way of learning these prices are for (step one), named in the heading when there is a choice of ways. */
  formatLabel?: string | null;
}

const formatPrice = (price: string) => `₦${Number(price).toLocaleString()}`;

/**
 * Lets a parent pick which published tier's price to pay (docs/pricing-model.md §4: a tier is picked directly
 * at checkout). A tier is only a price level, so each card shows the admin's line saying who the price is
 * for, and one fixed note says every tier gets the same course. Renders nothing when nothing is published
 * for this program -- there's nothing to choose, the flat price applies.
 */
export function TierCards({ groupId, tiers, value, onChange, formatLabel }: TierCardsProps) {
  if (tiers.length === 0) return null;

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs font-medium text-muted mb-1">{formatLabel ? "2. Choose a price" : "Choose a price"}</legend>
      {formatLabel && <p className="text-xs text-muted">Prices for {formatLabel}</p>}
      {tiers.length > 1 && (
        <p className="text-xs text-muted">
          Your child gets the same course and features whichever you pick. Choose the price that suits you.
        </p>
      )}
      {tiers.map((tier) => (
        <label
          key={tier.tier_id}
          className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 cursor-pointer ${
            value === tier.tier_id ? "border-primary bg-primary/5" : "border-muted/20 hover:border-muted/40"
          }`}
        >
          <span className="flex items-start gap-2">
            <input
              type="radio"
              name={`tier-${groupId}`}
              value={tier.tier_id}
              checked={value === tier.tier_id}
              onChange={() => onChange(tier.tier_id)}
              className="mt-0.5 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium">{tier.tier_name}</span>
              {tier.description && <span className="block text-xs text-muted">{tier.description}</span>}
            </span>
          </span>
          <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(tier.price)}</span>
        </label>
      ))}
    </fieldset>
  );
}
