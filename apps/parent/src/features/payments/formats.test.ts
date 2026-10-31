import { describe, expect, it } from "vitest";
import { FORMAT_ORDER, defaultTierId, formatChoices, formatFor, priceOf, tiersFor, type CatalogueFormat } from "./formats";

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

  it("charges the admin's default tier in any format", () => {
    const marked = formats.map((f) => ({ ...f, tier_prices: f.tier_prices.map((x) => ({ ...x, is_default: x.tier_id === "b" })) }));
    expect(defaultTierId(marked, [], "5000")).toBe("b");
    expect(priceOf(tiersFor(marked, "group", []), "b", "0")).toBe("24000");
  });

  it("falls back to the tier at the flat price when the API does not mark one", () => {
    expect(defaultTierId(formats, [], "5000")).toBe("a");
    expect(defaultTierId(formats, [], "123")).toBeUndefined();
    expect(defaultTierId(undefined, [t("z", "9")], "9")).toBe("z");
    expect(priceOf([], undefined, "5000")).toBe("5000");
  });
});

describe("formatChoices", () => {
  it("is always the three ways, in order, named for the parent", () => {
    expect(formatChoices(undefined).map((c) => c.format)).toEqual(FORMAT_ORDER);
    expect(formatChoices([]).map((c) => c.name)).toEqual(["Self-paced", "Live group (1 Tutor : 5 students)", "Live 1-to-1"]);
  });

  it("marks what is on sale, with the default tier's price", () => {
    const [self, group, one] = formatChoices(formats, "b");
    expect([self.onSale, self.price]).toEqual([true, 4000]);
    expect([group.onSale, group.price]).toEqual([true, 24000]);
    expect([one.onSale, one.price]).toEqual([false, null]);
  });
});
