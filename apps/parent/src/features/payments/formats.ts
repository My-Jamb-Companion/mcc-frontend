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

/** The three ways to learn, in the order they are offered. */
export const FORMAT_ORDER: LiveFormat[] = ["self_paced", "group", "one_to_one"];

/** Names the parent sees, whatever the API's own label says. */
export const FORMAT_NAMES: Record<LiveFormat, string> = {
  self_paced: "Self-paced",
  group: "Live group (1 Tutor : 5 students)",
  one_to_one: "Live 1-to-1",
};

export const FORMAT_BLURBS: Record<LiveFormat, string> = {
  self_paced: "Learns on their own time with lessons, quizzes and Brainy.",
  group: "Everything in self-paced, plus live classes with their Tutor and up to four other students.",
  one_to_one: "Everything in self-paced, plus live classes with a Tutor just for them.",
};

/** One of the three options as the card list shows it. */
export interface FormatChoice {
  format: LiveFormat;
  name: string;
  blurb: string;
  /** Priced and published, so it can be paid for. Otherwise it is shown but cannot be chosen. */
  onSale: boolean;
  /** The lowest tier price in this format; null when it is not on sale. */
  fromPrice: number | null;
}

/** All three options whether or not each is on sale yet, so a parent sees the whole range. */
export function formatChoices(formats: CatalogueFormat[] | undefined): FormatChoice[] {
  return FORMAT_ORDER.map((format) => {
    const offer = formats?.find((f) => f.format === format);
    const prices = (offer?.tier_prices ?? []).map((t) => Number(t.price)).filter(Number.isFinite);
    return {
      format,
      name: FORMAT_NAMES[format],
      blurb: FORMAT_BLURBS[format],
      onSale: !!offer && prices.length > 0,
      fromPrice: prices.length ? Math.min(...prices) : null,
    };
  });
}
