import type {ApiVerification} from "../services/verifications.service";

export const ID_TYPE_LABEL: Record<string, string> = {
  drivers_license: "Driver's licence",
  passport: "International passport",
  voters_card: "Voter's card",
  nin: "National ID (NIN)",
};

export const idTypeLabel = (type: string): string => ID_TYPE_LABEL[type] ?? type;

/** Whether a signed document link points at a PDF (it is shown in a frame; anything else is an image). */
export const isPdfLink = (url: string): boolean => /\.pdf(\?|#|$)/i.test(url);

/** What the NIN check found, in words an admin can act on. */
export function ninCheckNote(status: string): {label: string; tone: "good" | "warn"} {
  if (status === "verified") return {label: "NIN matched the name on file", tone: "good"};
  return {label: "NIN check unavailable: compare the documents by hand", tone: "warn"};
}

/** Pending first (oldest first, as the server sorts them), then the resolved ones newest first. */
export function sortQueue(items: ApiVerification[]): ApiVerification[] {
  const pending = items.filter((v) => v.status === "pending");
  const resolved = items
    .filter((v) => v.status !== "pending")
    .sort((a, b) => (b.reviewed_at ?? b.created_at).localeCompare(a.reviewed_at ?? a.created_at));
  return [...pending, ...resolved];
}

/** The account number with all but its last four digits hidden. */
export function maskAccount(value: string | null | undefined): string {
  if (!value) return "";
  return value.length <= 4 ? value : `${"•".repeat(value.length - 4)}${value.slice(-4)}`;
}
