import type {UpdateExamProgramContentPayload} from "../services/exam.service";

/**
 * The payload of a content save, carrying the content version the editor holds. Without a version (an older cached
 * copy of the page) the save goes without the protection, as before.
 */
export function withBaseVersion(
  payload: UpdateExamProgramContentPayload,
  version: number | null | undefined,
): UpdateExamProgramContentPayload {
  return typeof version === "number" ? {...payload, base_content_version: version} : payload;
}

/** Whether the server refused a save because the content changed since the editor opened it. */
export function isContentChanged(error: unknown): boolean {
  const code = (error as {response?: {data?: {error?: {code?: string}; error_code?: string}}})?.response?.data;
  return code?.error?.code === "CONTENT_CHANGED" || code?.error_code === "CONTENT_CHANGED";
}

/** What to tell the admin when a save is refused: the work was not saved, and nothing newer was lost. */
export const CONTENT_CHANGED_NOTICE =
  "This program was changed since you opened it (in another tab, another browser or by someone else), so nothing was saved: " +
  "saving now would have deleted that newer work. Reload the page to get the latest content, then make your changes again.";
