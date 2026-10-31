import { describe, expect, it } from "vitest";
import { FORMAT_ORDER, formatChoices, formatFor, tierFor, tiersFor, type CatalogueFormat } from "./formats";

const t = (id: string, price: string) => ({ tier_id: id, tier_name: id, price });
const formats: CatalogueFormat[] = [
  { format: "self_paced", label: "Self-paced", seats: 1, tier_prices: [t("a", "5000"), t("b", "4000")] },
  { format: "group", label: "Live group", seats: 5, tier_prices: [t("a", "30000"), t("b", "24000")] },
];

describe("live formats on the parent checkout", () => {
  it("falls back to the first format when none, or an unavailable one, is chosen", () => {
    expect(formatFor(formats, undefined)).toBe("self_paced");
    expect(formatFor(formats, "group")).toBe("group");
    expect(formatFor(formats, "one_to_one")).toBe("self_paced");
    expect(formatFor([], undefined)).toBeUndefined();
    expect(formatFor(undefined, "group")).toBeUndefined();
  });

  it("prices the chosen format, or the program's own list without formats", () => {
    expect(tiersFor(formats, "group", [])[0].price).toBe("30000");
    expect(tiersFor(undefined, undefined, [t("z", "1")])[0].tier_id).toBe("z");
  });

  it("keeps the picked tier across formats, else the one matching the flat price", () => {
    const group = tiersFor(formats, "group", []);
    expect(tierFor(group, "b", "5000")).toBe("b");
    expect(tierFor(group, undefined, "24000")).toBe("b");
    expect(tierFor(group, "gone", "1")).toBe("a");
    expect(tierFor([], undefined, "1")).toBeUndefined();
  });
});

describe("formatChoices", () => {
  it("is always the three ways, in order, named for the parent", () => {
    expect(formatChoices(undefined).map((c) => c.format)).toEqual(FORMAT_ORDER);
    expect(formatChoices([]).map((c) => c.name)).toEqual(["Self-paced", "Live group (1 Tutor : 5 students)", "Live 1-to-1"]);
  });

  it("marks what is on sale, with its lowest price", () => {
    const [self, group, one] = formatChoices(formats);
    expect([self.onSale, self.fromPrice]).toEqual([true, 4000]);
    expect([group.onSale, group.fromPrice]).toEqual([true, 24000]);
    expect([one.onSale, one.fromPrice]).toEqual([false, null]);
  });
});
