import {COUNTRIES, DEFAULT_COUNTRY, countryByIso} from "../constants/countries";

/**
 * The number as it is stored (international, "+2348012345678") from the chosen country and what the learner typed.
 * Typing a full international number ("+233 24 123 4567") wins over the chosen country; a leading 0 (the national
 * prefix, "0801...") is dropped. Returns "" for nothing typed and null for something that cannot be a real number.
 */
export function composePhone(iso2: string, typed: string): string | null {
  const trimmed = typed.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  let full: string;
  if (trimmed.startsWith("+")) full = digits;
  else if (trimmed.startsWith("00")) full = digits.slice(2);
  else full = (countryByIso(iso2)?.dial ?? "234") + digits.replace(/^0+/, "");

  return full.length >= 8 && full.length <= 15 ? `+${full}` : null;
}

/**
 * The stored number back into a country and the part to show in the box. A number with no "+" (saved before the
 * code was kept) is shown as it is, under the learner's country or Nigeria.
 */
export function splitPhone(stored: string, preferredIso2?: string): {iso2: string; number: string} {
  const fallback = preferredIso2 && countryByIso(preferredIso2) ? preferredIso2 : DEFAULT_COUNTRY;
  const value = (stored ?? "").trim();
  if (!value.startsWith("+")) return {iso2: fallback, number: value};

  const digits = value.replace(/\D/g, "");
  const matches = COUNTRIES.filter((c) => digits.startsWith(c.dial));
  if (matches.length === 0) return {iso2: fallback, number: value};

  const longest = Math.max(...matches.map((c) => c.dial.length));
  const candidates = matches.filter((c) => c.dial.length === longest);
  const chosen = candidates.find((c) => c.iso2 === preferredIso2) ?? candidates[0];
  return {iso2: chosen.iso2, number: digits.slice(chosen.dial.length)};
}
