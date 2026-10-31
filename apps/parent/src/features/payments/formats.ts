import type { CatalogueTierPrice } from "./payments.service";

/** How the child takes a program: on their own, in a live group of five, or one-to-one with a teacher. */
export type LiveFormat = "self_paced" | "group" | "one_to_one";

/** A format a program is on sale in, with its published price in every tier. */
export interface CatalogueFormat {
  format: LiveFormat;
  label: string;
  /** Students taught together in a live session (1 = one-to-one). */
  seats: number;
  /** Live sessions in this format (0 for self-paced). */
  live_sessions?: number;
  /** Length of each live session in hours. */
  hours_per_session?: number | string;
  /** Weeks the program runs; null until an admin enters it. */
  duration_weeks?: number | null;
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
 * The tier every purchase is charged: the one the admin marked as the default. Parents do not choose a tier. When
 * the API does not say (an older backend), the tier priced at the program's flat price is the default, since the
 * flat price is always the default tier's price.
 */
export const defaultTierId = (
  formats: CatalogueFormat[] | undefined,
  fallback: CatalogueTierPrice[],
  flatPrice: string,
): string | undefined => {
  const lists = [...(formats ?? []).map((f) => f.tier_prices), fallback];
  for (const list of lists) {
    const marked = list.find((t) => t.is_default);
    if (marked) return marked.tier_id;
  }
  return lists[0]?.find((t) => Number(t.price) === Number(flatPrice))?.tier_id;
};

/** What a list of tier prices charges: the default tier's price, else the program's flat price. */
export const priceOf = (tiers: CatalogueTierPrice[], tierId: string | undefined, flatPrice: string): string =>
  tiers.find((t) => t.tier_id === tierId)?.price ?? flatPrice;

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
  /** What the parent pays in this format (the default tier's price); null when it is not on sale. */
  price: number | null;
}

/** All three options whether or not each is on sale yet, so a parent sees the whole range. */
export function formatChoices(formats: CatalogueFormat[] | undefined, tierId?: string): FormatChoice[] {
  return FORMAT_ORDER.map((format) => {
    const offer = formats?.find((f) => f.format === format);
    const prices = (offer?.tier_prices ?? []).map((t) => Number(t.price)).filter(Number.isFinite);
    const onSale = !!offer && prices.length > 0;
    return {
      format,
      name: FORMAT_NAMES[format],
      blurb: FORMAT_BLURBS[format],
      onSale,
      price: onSale ? Number(priceOf(offer!.tier_prices, tierId, String(Math.min(...prices)))) : null,
    };
  });
}
