import {describe, expect, it} from "vitest";
import {defaultFormat, defaultTierId, gemsApply, priceOf, tiersFor, type ApiFormatOffer} from "./liveFormats";

const t = (id: string, price: number) => ({tier_id: id, tier_name: id, price});
const formats: ApiFormatOffer[] = [
  {format: "self_paced", label: "Self-paced", seats: 1, tier_prices: [t("a", 5000), t("b", 4000)]},
  {format: "one_to_one", label: "Live 1-to-1", seats: 1, tier_prices: [t("a", 90000), t("b", 70000)]},
];

describe("live formats at checkout", () => {
  it("starts on the first format on sale, or none", () => {
    expect(defaultFormat(formats)).toBe("self_paced");
    expect(defaultFormat([])).toBeNull();
    expect(defaultFormat(undefined)).toBeNull();
  });

  it("prices the chosen format, falling back to the program's own list", () => {
    expect(tiersFor(formats, "one_to_one", [])[0].price).toBe(90000);
    expect(tiersFor(undefined, null, [t("z", 1)])[0].tier_id).toBe("z");
    expect(tiersFor(formats, "group", [t("z", 1)])[0].tier_id).toBe("z");
  });

  it("charges the admin's default tier, in any format", () => {
    const marked: ApiFormatOffer[] = formats.map((f) => ({
      ...f,
      tier_prices: f.tier_prices.map((x) => ({...x, is_default: x.tier_id === "b"})),
    }));
    expect(defaultTierId(marked, [], 5000)).toBe("b");
    expect(priceOf(tiersFor(marked, "one_to_one", []), "b", 0)).toBe(70000);
  });

  it("falls back to the tier at the flat price when the API does not mark one", () => {
    expect(defaultTierId(formats, [], 5000)).toBe("a");
    expect(defaultTierId(formats, [], 123)).toBeNull();
    expect(defaultTierId(undefined, [t("z", 9)], 9)).toBe("z");
    expect(priceOf([], null, 5000)).toBe(5000);
  });

  it("offers gems for self-paced only", () => {
    expect(gemsApply("self_paced")).toBe(true);
    expect(gemsApply(null)).toBe(true);
    expect(gemsApply("group")).toBe(false);
    expect(gemsApply("one_to_one")).toBe(false);
  });
});

import {FORMAT_LABELS, FORMAT_ORDER, formatChoices} from "./liveFormats";

describe("formatChoices", () => {
  const offer = (format: "self_paced" | "group" | "one_to_one", prices: number[]) => ({
    format, label: format, seats: 1, tier_prices: prices.map((p, i) => ({tier_id: `t${i}`, tier_name: `T${i}`, price: p})),
  });

  it("is always the three ways, in order, with the buyer's names", () => {
    expect(formatChoices([]).map((c) => c.format)).toEqual(FORMAT_ORDER);
    expect(formatChoices(undefined).map((c) => c.label)).toEqual([
      "Self-paced", "Live group (1 Tutor : 5 students)", "Live 1-to-1",
    ]);
    expect(FORMAT_LABELS.group).toContain("Tutor");
  });

  it("marks what is on sale and the default tier's price", () => {
    const [self, group, one] = formatChoices([offer("self_paced", [11000, 7000, 9500]), offer("group", [61000])], "t2");
    expect([self.onSale, self.price]).toEqual([true, 9500]);
    expect([group.onSale, group.price]).toEqual([true, 61000]);
    expect([one.onSale, one.price]).toEqual([false, null]);
  });

  it("treats a way with no prices as not on sale", () => {
    expect(formatChoices([offer("group", [])])[1].onSale).toBe(false);
  });

  it("describes each way", () => {
    for (const c of formatChoices([])) expect(c.blurb.length).toBeGreaterThan(20);
  });
});
