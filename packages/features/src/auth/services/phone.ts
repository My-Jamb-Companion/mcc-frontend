/**
 * A phone number as the API wants it (E.164, "+2348012345678") from what a person types.
 * Handles "0801 234 5678", "234 801 234 5678", "+234 (801) 234-5678". Returns null when it
 * can't be a real number, so the form can say so before sending anything.
 */
export function toE164(input: string, defaultCountryCode = "234"): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  let full: string;
  if (trimmed.startsWith("+")) full = digits;
  else if (trimmed.startsWith("00")) full = digits.slice(2);
  else if (digits.startsWith("0")) full = defaultCountryCode + digits.slice(1);
  else if (digits.startsWith(defaultCountryCode)) full = digits;
  else full = defaultCountryCode + digits;

  return full.length >= 10 && full.length <= 15 ? `+${full}` : null;
}
