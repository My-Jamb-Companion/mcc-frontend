import {BLOCK_BY_TYPE, isSafeHref, str} from "@mcc/landing-content";
import type {Field, FieldData, LandingBlock} from "@mcc/landing-content";

/** A blank record for a list field: every field present and empty, so the form always has something to show. */
export function emptyItem(fields: Field[]): FieldData {
  const item: FieldData = {};
  for (const field of fields) {
    if (field.kind === "toggle") item[field.key] = false;
    else if (field.kind === "strings" || field.kind === "list") item[field.key] = [];
    else if (field.kind === "select") item[field.key] = field.options[0]?.value ?? "";
    else item[field.key] = "";
  }
  return item;
}

/** What to call a block in the list: its type, plus its headline when it has one. */
export function blockTitle(block: LandingBlock): string {
  return BLOCK_BY_TYPE[block.type]?.label ?? block.type;
}

export function blockSubtitle(block: LandingBlock): string {
  const d = block.data;
  const text = str(d, "headline") || [str(d, "headline_lead"), str(d, "headline_emph")].filter(Boolean).join(" ") || str(d, "call_title");
  return text.trim();
}

export type EditorStatus = {label: string; tone: "ok" | "warn" | "muted"};

/**
 * The one-line state of the page, shown beside the Save and Publish buttons.
 * `dirty`: edits in the editor not yet saved. `hasDraft`: a saved draft exists.
 */
export function editorStatus(s: {dirty: boolean; hasDraft: boolean; hasPublished: boolean; draftDiffers: boolean; notPublishedLabel?: string}): EditorStatus {
  if (s.dirty) return {label: "Unsaved changes", tone: "warn"};
  if (s.hasDraft && s.draftDiffers) return {label: "Draft saved, not published", tone: "warn"};
  if (s.hasPublished) return {label: "Published", tone: "ok"};
  return {label: s.notPublishedLabel ?? "Not published yet: visitors see the built-in design", tone: "muted"};
}

/** The text the reorder buttons announce. */
export const positionLabel = (index: number, total: number) => `${index + 1} of ${total}`;

/**
 * Links and image addresses the backend would refuse (anything under a key ending in url or href that
 * isn't https://, http://, mailto:, tel:, # or a site path), so the editor can say so before saving.
 */
export function findUnsafeLinks(value: unknown, path = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((item, i) => findUnsafeLinks(item, `${path}[${i}]`));
  if (value && typeof value === "object")
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
      const at = path ? `${path}.${key}` : key;
      if (/(url|href)$/i.test(key) && typeof item === "string") return isSafeHref(item) ? [] : [at];
      return findUnsafeLinks(item, at);
    });
  return [];
}
