import type {UpdateCoursePayload} from "../types/types";

/**
 * A course save's payload carrying the content version the editor holds. Without a version (the editor has not yet
 * learned one) the save goes without the protection; every later save has it.
 */
export function withCourseVersion(payload: UpdateCoursePayload, version: number | null | undefined): UpdateCoursePayload {
  return typeof version === "number" && payload.modules ? {...payload, base_content_version: version} : payload;
}

/** The version to hold after a save: the one the server returned, else the one held. */
export function nextVersion(held: number | null, returned: number | undefined): number | null {
  return typeof returned === "number" ? returned : held;
}
