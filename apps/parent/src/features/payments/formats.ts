import type { CatalogueTierPrice } from "./payments.service";

/** How the child takes a program: on their own, in a live group of five, or one-to-one with a teacher. */
export type LiveFormat = "self_paced" | "group" | "one_to_one";

/** A format a program is on sale in, with its published price in every tier. */
export interface CatalogueFormat {
  format: LiveFormat;
  label: string;
  /** Students taught together in a live session (1 = one-to-one). */
  seats: number;
  tier_prices: CatalogueTierPrice[];
}

/** The format selected, else the first on sale (self-paced when it is), or none for an unpriced program. */
export const formatFor = (formats: CatalogueFormat[] | undefined, chosen: LiveFormat | undefined): LiveFormat | undefined =>
  formats?.find((f) => f.format === chosen)?.format ?? formats?.[0]?.format;

/** The tier prices for the chosen format; the program's own list when it has no formats. */
export const tiersFor = (
  formats: CatalogueFormat[] | undefined,
  format: LiveFormat | undefined,
  fallback: CatalogueTierPrice[],
): CatalogueTierPrice[] => formats?.find((f) => f.format === format)?.tier_prices ?? fallback;

/**
 * The tier to use: the parent's own pick if the chosen format has it (tiers are shared across formats), else
 * the tier matching the program's flat price, else the first.
 */
export const tierFor = (tiers: CatalogueTierPrice[], picked: string | undefined, flatPrice: string): string | undefined =>
  tiers.find((t) => t.tier_id === picked)?.tier_id ??
  tiers.find((t) => Number(t.price) === Number(flatPrice))?.tier_id ??
  tiers[0]?.tier_id;

/** Short names for the picker; the API label is longer than a row has room for. */
export const FORMAT_NAMES: Record<LiveFormat, string> = {
  self_paced: "Self-paced",
  group: "Live group (1:5)",
  one_to_one: "Live 1-to-1",
};
