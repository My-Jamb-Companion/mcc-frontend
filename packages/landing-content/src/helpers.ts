import { BLOCK_BY_TYPE } from "./blocks";
import { SITE_DEFAULTS } from "./site";
import type { FieldData } from "./fields";
import type { LandingBlock, LandingContent } from "./types";

// ---- reading CMS data safely: whatever is stored, a renderer never crashes on it ----

export function str(data: FieldData | undefined, key: string, fallback = ""): string {
  const value = data?.[key];
  return typeof value === "string" ? value : fallback;
}

export function bool(data: FieldData | undefined, key: string, fallback = false): boolean {
  const value = data?.[key];
  return typeof value === "boolean" ? value : fallback;
}

export function list(data: FieldData | undefined, key: string): FieldData[] {
  const value = data?.[key];
  return Array.isArray(value) ? value.filter((v): v is FieldData => !!v && typeof v === "object" && !Array.isArray(v)) : [];
}

export function strings(data: FieldData | undefined, key: string): string[] {
  const value = data?.[key];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];
}

// ---- links ----

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i;

/** The same rule the backend enforces: nothing that can run script. Empty is fine (no link). */
export function isSafeHref(href: string): boolean {
  const value = href.trim();
  return value === "" || SAFE_HREF.test(value);
}

/** What to put in an href: an unsafe or empty address becomes "#". */
export function safeHref(href: string): string {
  const value = href.trim();
  return value !== "" && SAFE_HREF.test(value) ? value : "#";
}

// ---- turning what the API returned into a page ----

/**
 * Accepts whatever came back (it may be old, partial or hand-edited) and returns a page the
 * renderers can draw. Site settings fall back to their defaults one by one; blocks are kept as
 * they are, with anything malformed dropped.
 */
export function normalizeContent(raw: unknown): LandingContent {
  const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const site = input.site && typeof input.site === "object" && !Array.isArray(input.site) ? (input.site as FieldData) : {};
  const blocks = Array.isArray(input.blocks) ? input.blocks : [];

  return {
    site: { ...SITE_DEFAULTS, ...site },
    blocks: blocks.flatMap((b): LandingBlock[] => {
      if (!b || typeof b !== "object") return [];
      const block = b as Record<string, unknown>;
      if (typeof block.id !== "string" || typeof block.type !== "string") return [];
      const data = block.data && typeof block.data === "object" && !Array.isArray(block.data) ? (block.data as FieldData) : {};
      return [{ id: block.id, type: block.type, visible: block.visible !== false, data }];
    }),
  };
}

/** Blocks a visitor should see: visible, and of a type this version of the site knows how to draw. */
export function visibleBlocks(content: LandingContent): LandingBlock[] {
  return content.blocks.filter((b) => b.visible && BLOCK_BY_TYPE[b.type]);
}

// ---- editing ----

export function newBlockId(): string {
  return `blk_${Math.random().toString(36).slice(2, 10)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createBlock(type: string): LandingBlock {
  const def = BLOCK_BY_TYPE[type];
  if (!def) throw new Error(`Unknown block type: ${type}`);
  return { id: newBlockId(), type, visible: true, data: clone(def.defaults) };
}

export function insertBlock(blocks: LandingBlock[], block: LandingBlock, index: number = blocks.length): LandingBlock[] {
  const at = Math.max(0, Math.min(index, blocks.length));
  return [...blocks.slice(0, at), block, ...blocks.slice(at)];
}

export function removeBlock(blocks: LandingBlock[], id: string): LandingBlock[] {
  return blocks.filter((b) => b.id !== id);
}

export function duplicateBlock(blocks: LandingBlock[], id: string): LandingBlock[] {
  const at = blocks.findIndex((b) => b.id === id);
  if (at < 0) return blocks;
  return insertBlock(blocks, { ...clone(blocks[at]), id: newBlockId() }, at + 1);
}

/** Move the block with `id` to position `to` (clamped). */
export function moveBlock(blocks: LandingBlock[], id: string, to: number): LandingBlock[] {
  const from = blocks.findIndex((b) => b.id === id);
  if (from < 0) return blocks;
  const target = Math.max(0, Math.min(to, blocks.length - 1));
  if (target === from) return blocks;
  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}

export function updateBlock(blocks: LandingBlock[], id: string, patch: Partial<Omit<LandingBlock, "id" | "type">>): LandingBlock[] {
  return blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
}

/** Move an item inside one list field's array. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length) return items;
  const target = Math.max(0, Math.min(to, items.length - 1));
  if (target === from) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved);
  return next;
}

/** True when two pages hold the same content (for "unsaved changes"). */
export function sameContent(a: LandingContent, b: LandingContent): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
