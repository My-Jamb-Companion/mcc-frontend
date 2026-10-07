import { BLOCK_BY_TYPE } from "./blocks";
import { SITE_DEFAULTS } from "./site";
import type { LandingBlock, LandingContent } from "./types";

/** Sections with nothing real to say yet are present but hidden, so an admin finds them and fills them in. */
const HIDDEN_UNTIL_FILLED = new Set(["courses", "proof"]);

const ORDER = ["hero", "exams", "steps", "brainy", "practice", "humans", "courses", "parents", "proof", "faq", "cta"];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** The page as designed. The site shows this until something is published, and the editor starts from it. */
export function defaultContent(): LandingContent {
  const blocks: LandingBlock[] = ORDER.map((type) => ({
    id: `blk_${type}`,
    type,
    visible: !HIDDEN_UNTIL_FILLED.has(type),
    data: clone(BLOCK_BY_TYPE[type].defaults),
  }));
  return { site: clone(SITE_DEFAULTS), blocks };
}
