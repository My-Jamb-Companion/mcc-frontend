import type { CatalogueTierPrice } from "./types";

interface TierSelectProps {
  tiers: CatalogueTierPrice[];
  value: string;
  onChange: (tierId: string) => void;
}

/**
 * Compact tier picker for a catalogue card -- lets a visitor pick which
 * published tier's price they'll pay at enrolment (docs/pricing-model.md §4,
 * D2/D3 revised in the backend repo: a tier is picked directly at checkout,
 * not derived from a city). Renders nothing when nothing is published for
 * this course/program -- there's nothing to choose, the flat price applies.
 */
export const TierSelect = ({ tiers, value, onChange }: TierSelectProps) => {
  if (tiers.length === 0) return null;

  return (
    <select
      aria-label="Pricing tier"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg border border-muted/20 bg-transparent px-2 py-1 text-xs"
    >
      {tiers.map((tier) => (
        <option key={tier.tier_id} value={tier.tier_id}>
          {tier.tier_name} — ₦{tier.price.toLocaleString()}
        </option>
      ))}
    </select>
  );
};
