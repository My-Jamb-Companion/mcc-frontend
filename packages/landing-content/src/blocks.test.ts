import { describe, expect, it } from "vitest";
import { BLOCKS, BLOCK_BY_TYPE } from "./blocks";
import { defaultContent } from "./defaults";
import type { Field } from "./fields";
import { SITE_DEFAULTS, SITE_FIELDS } from "./site";
import { isSafeHref } from "./helpers";

/** Every key a set of fields can hold, so defaults can be checked against what the editor shows. */
function walk(fields: Field[], data: Record<string, unknown>, problems: string[], path: string) {
  const known = new Set(fields.map((f) => f.key));
  for (const key of Object.keys(data)) if (!known.has(key)) problems.push(`${path}.${key} has no field`);

  for (const field of fields) {
    const value = data[field.key];
    const at = `${path}.${field.key}`;
    if (value === undefined) { problems.push(`${at} has no default`); continue; }

    if (field.kind === "url" || field.kind === "image") {
      if (typeof value !== "string") problems.push(`${at} must be text`);
      else if (!/(url|href)$/.test(field.key)) problems.push(`${at}: the backend only checks keys ending in url or href`);
      else if (!isSafeHref(value)) problems.push(`${at} is not a safe link`);
    } else if (field.kind === "toggle") {
      if (typeof value !== "boolean") problems.push(`${at} must be true/false`);
    } else if (field.kind === "strings") {
      if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) problems.push(`${at} must be a list of text`);
    } else if (field.kind === "list") {
      if (!Array.isArray(value)) problems.push(`${at} must be a list`);
      else value.forEach((item, i) => walk(field.fields, item as Record<string, unknown>, problems, `${at}[${i}]`));
    } else if (typeof value !== "string") problems.push(`${at} must be text`);
  }
}

describe("the block registry", () => {
  it("has one definition per type, each with an anchor and fields", () => {
    expect(new Set(BLOCKS.map((b) => b.type)).size).toBe(BLOCKS.length);
    for (const block of BLOCKS) {
      expect(block.fields.length, block.type).toBeGreaterThan(0);
      expect(block.anchor, block.type).toMatch(/^[a-z]+$/);
    }
  });

  it("gives every block defaults that match its fields", () => {
    const problems: string[] = [];
    for (const block of BLOCKS) walk(block.fields, block.defaults, problems, block.type);
    expect(problems).toEqual([]);
  });

  it("gives the site settings defaults that match their fields", () => {
    const problems: string[] = [];
    walk(SITE_FIELDS, SITE_DEFAULTS, problems, "site");
    expect(problems).toEqual([]);
  });

  it("only uses field names the backend will check as links when they hold links", () => {
    const bad: string[] = [];
    const check = (fields: Field[], path: string) => {
      for (const f of fields) {
        if ((f.kind === "url" || f.kind === "image") && !/(url|href)$/.test(f.key)) bad.push(`${path}.${f.key}`);
        if (f.kind === "list") check(f.fields, `${path}.${f.key}`);
      }
    };
    BLOCKS.forEach((b) => check(b.fields, b.type));
    check(SITE_FIELDS, "site");
    expect(bad).toEqual([]);
  });
});

describe("the default page", () => {
  it("has every block type once, in a sensible order, with unique ids", () => {
    const page = defaultContent();
    expect(page.blocks.map((b) => b.type)).toEqual(Object.keys(BLOCK_BY_TYPE));
    expect(new Set(page.blocks.map((b) => b.id)).size).toBe(page.blocks.length);
  });

  it("hides the sections that have no real content yet", () => {
    const hidden = defaultContent().blocks.filter((b) => !b.visible).map((b) => b.type);
    expect(hidden.sort()).toEqual(["courses", "proof"]);
  });

  it("does not share objects between calls", () => {
    const a = defaultContent(); a.blocks[0].data.headline_lead = "changed";
    expect(defaultContent().blocks[0].data.headline_lead).toBe("Walk into your exam");
  });
});
