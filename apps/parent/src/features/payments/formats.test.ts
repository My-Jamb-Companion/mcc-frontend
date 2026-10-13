import { describe, expect, it } from "vitest";
import { formatFor, tierFor, tiersFor, type CatalogueFormat } from "./formats";

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
