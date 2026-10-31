"use client";

export interface TierPriceOption {
  tier_id: string;
  tier_name: string;
  price: number | string;
  /** Admin-written line saying who this price is for. Empty when none. */
  description?: string;
}

interface TierPickerProps {
  tiers: TierPriceOption[];
  selectedTierId: string | null;
  onSelect: (tierId: string) => void;
  /** The way of learning these prices are for (step one), named in the heading when there is a choice of ways. */
  formatLabel?: string | null;
}

const formatPrice = (price: number | string) => `₦${Number(price).toLocaleString()}`;

/**
 * Lets a buyer pick which published tier's price to pay at enrolment
 * (docs/pricing-model.md §4, D2/D3 revised in the backend repo: a tier is
 * picked directly, per purchase, and nothing is derived from the buyer's
 * profile). A tier is only a price level, so each option shows the admin's
 * line saying who the price is for, and one fixed note says every tier gets
 * the same course. Renders nothing when a program has no published tiers,
 * since there's nothing to choose -- the flat price applies.
 */
export function TierPicker({tiers, selectedTierId, onSelect, formatLabel}: TierPickerProps) {
  if (tiers.length === 0) return null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold mb-1">{formatLabel ? "2. Choose your price" : "Choose your price"}</legend>
      {formatLabel && <p className="text-xs text-subtle -mt-1">Prices for {formatLabel}</p>}
      {tiers.length > 1 && (
        <p className="text-xs text-subtle -mt-1 mb-1">
          You get the same course and features whichever you pick. Choose the price that suits you.
        </p>
      )}
      {tiers.map((tier) => (
        <label
          key={tier.tier_id}
          className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
            selectedTierId === tier.tier_id
              ? "border-primary bg-primary/5"
              : "border-muted/30 hover:border-muted/60"
          }`}
        >
          <span className="flex items-start gap-2">
            <input
              type="radio"
              name="pricing-tier"
              value={tier.tier_id}
              checked={selectedTierId === tier.tier_id}
              onChange={() => onSelect(tier.tier_id)}
              className="mt-1 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium">{tier.tier_name}</span>
              {tier.description && <span className="block text-xs text-subtle">{tier.description}</span>}
            </span>
          </span>
          <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(tier.price)}</span>
        </label>
      ))}
    </fieldset>
  );
}
