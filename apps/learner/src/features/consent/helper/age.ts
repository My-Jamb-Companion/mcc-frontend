/** The age of majority: a student under it needs a parent or guardian's consent. */
export const ADULT_AGE = 18;

const parts = (iso: string): [number, number, number] | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};

/** Whole years between a YYYY-MM-DD date of birth and today, or null when the text isn't a real date. */
export const ageFromDob = (iso: string, today: Date = new Date()): number | null => {
  const p = parts(iso);
  if (!p) return null;
  const [y, m, d] = p;
  const born = new Date(Date.UTC(y, m - 1, d));
  if (born.getUTCFullYear() !== y || born.getUTCMonth() !== m - 1 || born.getUTCDate() !== d) return null;
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
};

/** A date of birth that is a real date, not in the future, and not absurdly old. */
export const isPlausibleDob = (iso: string, today: Date = new Date()): boolean => {
  const age = ageFromDob(iso, today);
  return age !== null && age >= 0 && age <= 100;
};

export const isUnder18 = (iso: string, today: Date = new Date()): boolean => {
  const age = ageFromDob(iso, today);
  return age !== null && age >= 0 && age < ADULT_AGE;
};

/** Today as YYYY-MM-DD, for the date input's `max`. */
export const todayIso = (today: Date = new Date()): string =>
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
