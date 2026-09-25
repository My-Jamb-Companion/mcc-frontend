"use client";

export interface TierPriceOption {
  tier_id: string;
  tier_name: string;
  price: number | string;
}

interface TierPickerProps {
  tiers: TierPriceOption[];
  selectedTierId: string | null;
  onSelect: (tierId: string) => void;
}

const formatPrice = (price: number | string) => `₦${Number(price).toLocaleString()}`;

/**
 * Lets a buyer pick which published tier's price to pay at enrolment
 * (docs/pricing-model.md §4, D2/D3 revised in the backend repo -- a tier
 * used to be derived from a city the student was locked into; now it's
 * picked directly, per purchase). Renders nothing when a program has no
 * published tiers, since there's nothing to choose -- the flat price applies.
 */
export function TierPicker({tiers, selectedTierId, onSelect}: TierPickerProps) {
  if (tiers.length === 0) return null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold mb-1">Choose your price tier</legend>
      {tiers.map((tier) => (
        <label
          key={tier.tier_id}
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
            selectedTierId === tier.tier_id
              ? "border-primary bg-primary/5"
              : "border-muted/30 hover:border-muted/60"
          }`}
        >
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name="pricing-tier"
              value={tier.tier_id}
              checked={selectedTierId === tier.tier_id}
              onChange={() => onSelect(tier.tier_id)}
              className="accent-primary"
            />
            <span className="text-sm font-medium">{tier.tier_name}</span>
          </span>
          <span className="text-sm font-semibold">{formatPrice(tier.price)}</span>
        </label>
      ))}
    </fieldset>
  );
}
