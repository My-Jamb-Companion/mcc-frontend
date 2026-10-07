/**
 * How a block's data is edited. The admin editor builds its form from these, so adding a
 * field here is all it takes for it to show up (the landing site decides how to draw it).
 *
 * Naming matters: the backend refuses any value under a key ending in `url` or `href`
 * unless it is a safe link, so links and image addresses must use such names.
 */
export type TextField = {
  kind: "text" | "textarea";
  key: string;
  label: string;
  help?: string;
  maxLength?: number;
};

/** A link or image address: https://, a site path like /signup, #anchor, mailto: or tel:. */
export type UrlField = {
  kind: "url";
  key: string;
  label: string;
  help?: string;
};

export type ImageField = {
  kind: "image";
  key: string;
  label: string;
  help?: string;
};

export type ToggleField = {
  kind: "toggle";
  key: string;
  label: string;
  help?: string;
};

export type SelectField = {
  kind: "select";
  key: string;
  label: string;
  help?: string;
  options: { value: string; label: string }[];
};

/** A list of short strings (e.g. the ticks under the hero button). */
export type StringsField = {
  kind: "strings";
  key: string;
  label: string;
  help?: string;
  itemLabel: string;
  max?: number;
};

/** A list of small records (e.g. FAQ questions), each edited with `fields`. */
export type ListField = {
  kind: "list";
  key: string;
  label: string;
  help?: string;
  itemLabel: string;
  /** Which field names an item in the collapsed list. */
  titleKey: string;
  fields: Field[];
  max?: number;
};

export type Field = TextField | UrlField | ImageField | ToggleField | SelectField | StringsField | ListField;

export type FieldData = Record<string, unknown>;
