/** The two lists exam programs are filed under. */
export type CatalogKind = "types" | "subjects";

export interface CatalogItem {
  id: string;
  name: string;
  is_active: boolean;
  /** How many programs use it. */
  program_count: number;
}

export const CATALOG_LABELS: Record<
  CatalogKind,
  {singular: string; plural: string; example: string; endpoint: string; idKey: string}
> = {
  types: {singular: "exam type", plural: "Exam types", example: "JAMB", endpoint: "types", idKey: "exam_id"},
  subjects: {singular: "subject", plural: "Subjects", example: "Mathematics", endpoint: "subjects", idKey: "subject_id"},
};

/** The API names the id `exam_id` or `subject_id`; the UI works with one `id`. */
export function normalizeCatalogItem(kind: CatalogKind, raw: Record<string, unknown>): CatalogItem {
  return {
    id: String(raw[CATALOG_LABELS[kind].idKey]),
    name: String(raw.name ?? ""),
    is_active: raw.is_active !== false,
    program_count: Number(raw.program_count ?? 0),
  };
}

/**
 * Picker options: active items, plus the currently selected one even when it
 * has since been deactivated (so editing a program that uses it still shows
 * its value instead of a blank select).
 */
export function toOptions(
  items: CatalogItem[],
  selectedId?: string,
): {label: string; value: string}[] {
  return items
    .filter((i) => i.is_active || i.id === selectedId)
    .map((i) => ({label: i.is_active ? i.name : `${i.name} (inactive)`, value: i.id}));
}

/** Case-insensitive name filter for the management table. */
export function filterByName(items: CatalogItem[], query: string): CatalogItem[] {
  const needle = query.trim().toLowerCase();
  return needle ? items.filter((i) => i.name.toLowerCase().includes(needle)) : items;
}
