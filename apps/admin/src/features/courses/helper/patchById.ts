/**
 * Returns `tree` with the one object whose `id` is `id` updated by `patch`, wherever it sits
 * (topic, sub-topic, module, lesson...). Everything else is returned as it is, untouched.
 *
 * Ids are unique across the whole content tree, so this finds the right lesson without knowing
 * which module the admin is looking at. An upload that finishes minutes after it started uses this
 * to record its file address: it must change that one lesson and nothing else, however much the
 * content has changed since the upload began.
 */
export function patchById<T>(tree: T, id: string, patch: Record<string, unknown>): T {
  if (Array.isArray(tree)) {
    let changed = false;
    const next = tree.map((item) => {
      const updated = patchById(item, id, patch);
      if (updated !== item) changed = true;
      return updated;
    });
    return (changed ? next : tree) as T;
  }
  if (tree && typeof tree === "object") {
    const obj = tree as Record<string, unknown>;
    if (obj.id === id) return {...obj, ...patch} as T;
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // A File or a Date is a value, not part of the tree.
      const updated = value && typeof value === "object" && !(value instanceof File) && !(value instanceof Date)
        ? patchById(value, id, patch)
        : value;
      if (updated !== value) changed = true;
      next[key] = updated;
    }
    return (changed ? next : tree) as T;
  }
  return tree;
}
