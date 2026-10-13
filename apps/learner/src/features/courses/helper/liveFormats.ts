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

export const FORMAT_BLURBS: Record<LiveFormat, string> = {
  self_paced: "Learn on your own time with lessons, quizzes and Brainy.",
  group: "Everything in self-paced, plus live classes with a teacher and up to four other students.",
  one_to_one: "Everything in self-paced, plus live classes with a teacher just for you.",
};

/** The format a buyer starts on: the first one on sale (self-paced when it is), or none for an unpriced program. */
export const defaultFormat = (formats: ApiFormatOffer[] | undefined): LiveFormat | null => formats?.[0]?.format ?? null;

/** The tier prices for the chosen format; the program's own list when it has no formats. */
export const tiersFor = (
  formats: ApiFormatOffer[] | undefined,
  format: LiveFormat | null,
  fallback: ApiTierPrice[] | undefined,
): ApiTierPrice[] => formats?.find((f) => f.format === format)?.tier_prices ?? fallback ?? [];

/**
 * The tier to select after the format changes: keep the buyer's tier when the new format has it (tiers are
 * shared across formats), else the one matching the flat price, else the first.
 */
export const tierAfterFormatChange = (
  tiers: ApiTierPrice[],
  previousTierId: string | null,
  flatPrice: number,
): string | null =>
  tiers.find((t) => t.tier_id === previousTierId)?.tier_id ??
  tiers.find((t) => Number(t.price) === flatPrice)?.tier_id ??
  tiers[0]?.tier_id ??
  null;

/** Gems only buy self-paced access, so the option is offered for that format (or an unformatted program). */
export const gemsApply = (format: LiveFormat | null): boolean => format === null || format === "self_paced";
