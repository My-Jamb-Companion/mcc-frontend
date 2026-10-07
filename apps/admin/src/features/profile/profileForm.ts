export const MIN_PASSWORD = 6;
export const MAX_PHOTO_MB = 5;

/** What stops a password change, in the order a person should fix it (null when it can go ahead). */
export function passwordProblem(current: string, next: string, confirm: string): string | null {
  if (!current) return "Enter your current password";
  if (next.length < MIN_PASSWORD) return `The new password needs at least ${MIN_PASSWORD} characters`;
  if (next === current) return "Choose a password different from your current one";
  if (next !== confirm) return "The new passwords don't match";
  return null;
}

/** Why a picked file can't be a profile photo (null when it can). */
export function photoProblem(file: Pick<File, "type" | "size" | "name">): string | null {
  if (!file.type.startsWith("image/")) return `${file.name} isn't an image`;
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) return `Choose a photo of ${MAX_PHOTO_MB} MB or less`;
  return null;
}

/** The fields that actually changed, trimmed; empty when nothing did. */
export function changedFields(
  original: {full_name?: string | null; username?: string | null; phone_number?: string | null},
  edited: {full_name: string; username: string; phone_number: string},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of ["full_name", "username", "phone_number"] as const) {
    const next = edited[key].trim();
    if (next !== (original[key] ?? "").trim()) out[key] = next;
  }
  return out;
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]).toUpperCase();
}
