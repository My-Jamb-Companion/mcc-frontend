"use client";

import type { CatalogueTierPrice } from "./payments.service";

interface TierSelectProps {
  tiers: CatalogueTierPrice[];
  value: string | null;
  onChange: (tierId: string) => void;
}

const formatPrice = (price: string) => `₦${Number(price).toLocaleString()}`;

/**
 * Compact tier picker for the child-enrolment row list -- lets a parent pick
 * which published tier's price to pay (docs/pricing-model.md §4, D2/D3
 * revised in the backend repo: a tier is picked directly at checkout, not
 * derived from a city). Renders nothing when nothing is published for this
 * program -- there's nothing to choose, the flat price applies.
 */
export function TierSelect({ tiers, value, onChange }: TierSelectProps) {
  if (tiers.length === 0) return null;

  return (
    <select
      aria-label="Pricing tier"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-muted/20 bg-transparent px-2 py-1 text-xs"
    >
      {tiers.map((tier) => (
        <option key={tier.tier_id} value={tier.tier_id}>
          {tier.tier_name} — {formatPrice(tier.price)}
        </option>
      ))}
    </select>
  );
}
