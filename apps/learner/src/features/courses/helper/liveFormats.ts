import type {ApiTierPrice} from "../services/course.service";

/** How a student takes a program: on their own, in a live group of five, or one-to-one with a teacher. */
export type LiveFormat = "self_paced" | "group" | "one_to_one";

/** A format a program is on sale in, with its published price in every tier. */
export interface ApiFormatOffer {
  format: LiveFormat;
  label: string;
  /** Students taught together in a live session (1 = one-to-one). */
  seats: number;
  tier_prices: ApiTierPrice[];
}

/** The three ways to learn, in the order they are offered. */
export const FORMAT_ORDER: LiveFormat[] = ["self_paced", "group", "one_to_one"];

/** What a buyer sees, whatever the API's own label says. */
export const FORMAT_LABELS: Record<LiveFormat, string> = {
  self_paced: "Self-paced",
  group: "Live group (1 Tutor : 5 students)",
  one_to_one: "Live 1-to-1",
};

export const FORMAT_BLURBS: Record<LiveFormat, string> = {
  self_paced: "Learn on your own time with lessons, quizzes and Brainy.",
  group: "Everything in self-paced, plus live classes with your Tutor and up to four other students.",
  one_to_one: "Everything in self-paced, plus live classes with a Tutor just for you.",
};

/** One of the three options as the picker shows it. */
export interface FormatChoice {
  format: LiveFormat;
  label: string;
  blurb: string;
  /** Priced and published, so it can be bought. Otherwise the option is shown but cannot be chosen. */
  onSale: boolean;
  /** What the buyer pays in this format (the default tier's price); null when it is not on sale. */
  price: number | null;
}

/**
 * The tier every purchase is charged: the one the admin marked as the default. Buyers do not choose a tier. When
 * the API does not say (an older backend), the tier whose price is the program's flat price is the default, since
 * the flat price is always the default tier's price.
 */
export function defaultTierId(
  formats: ApiFormatOffer[] | undefined,
  fallback: ApiTierPrice[] | undefined,
  flatPrice: number,
): string | null {
  const lists = [...(formats ?? []).map((f) => f.tier_prices), fallback ?? []];
  for (const list of lists) {
    const marked = list.find((t) => t.is_default);
    if (marked) return marked.tier_id;
  }
  return lists[0]?.find((t) => Number(t.price) === flatPrice)?.tier_id ?? null;
}

/** What a list of tier prices charges: the default tier's price, else the program's flat price. */
export const priceOf = (tiers: ApiTierPrice[], tierId: string | null, flatPrice: number): number => {
  const price = Number(tiers.find((t) => t.tier_id === tierId)?.price);
  return Number.isFinite(price) ? price : flatPrice;
};

/**
 * All three options, whether or not each is on sale yet: a buyer should see the whole range, with the ones that are
 * not available marked as such, rather than a list that silently leaves live teaching out. Each on-sale option
 * carries the price the buyer would pay (the default tier's).
 */
export function formatChoices(formats: ApiFormatOffer[] | undefined, tierId: string | null = null): FormatChoice[] {
  return FORMAT_ORDER.map((format) => {
    const offer = formats?.find((f) => f.format === format);
    const prices = (offer?.tier_prices ?? []).map((t) => Number(t.price)).filter(Number.isFinite);
    const onSale = !!offer && prices.length > 0;
    return {
      format,
      label: FORMAT_LABELS[format],
      blurb: FORMAT_BLURBS[format],
      onSale,
      price: onSale ? priceOf(offer!.tier_prices, tierId, Math.min(...prices)) : null,
    };
  });
}

/** The format a buyer starts on: the first one on sale (self-paced when it is), or none for an unpriced program. */
export const defaultFormat = (formats: ApiFormatOffer[] | undefined): LiveFormat | null => formats?.[0]?.format ?? null;

/** The tier prices for the chosen format; the program's own list when it has no formats. */
export const tiersFor = (
  formats: ApiFormatOffer[] | undefined,
  format: LiveFormat | null,
  fallback: ApiTierPrice[] | undefined,
): ApiTierPrice[] => formats?.find((f) => f.format === format)?.tier_prices ?? fallback ?? [];

/** Gems only buy self-paced access, so the option is offered for that format (or an unformatted program). */
export const gemsApply = (format: LiveFormat | null): boolean => format === null || format === "self_paced";
