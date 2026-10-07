import type { Field, FieldData } from "./fields";

/** One section of the page, as stored. */
export type LandingBlock = {
  id: string;
  type: string;
  visible: boolean;
  data: FieldData;
};

/** The whole page, as stored (one version row's `content`). */
export type LandingContent = {
  site: FieldData;
  blocks: LandingBlock[];
};

/** What the editor needs to know about a kind of block. */
export type BlockDefinition = {
  type: string;
  label: string;
  description: string;
  /** An Iconify name, for the block list and the "add a section" gallery. */
  icon: string;
  /** The element id the section carries, so menu links like #exams can reach it. */
  anchor: string;
  fields: Field[];
  /** What a freshly added block starts with. */
  defaults: FieldData;
};
