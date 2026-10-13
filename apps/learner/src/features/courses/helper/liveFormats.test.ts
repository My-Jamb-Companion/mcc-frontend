import {describe, expect, it} from "vitest";
import {defaultFormat, gemsApply, tierAfterFormatChange, tiersFor, type ApiFormatOffer} from "./liveFormats";

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

  it("keeps the buyer's tier when switching format", () => {
    const live = tiersFor(formats, "one_to_one", []);
    expect(tierAfterFormatChange(live, "b", 5000)).toBe("b");
    expect(tierAfterFormatChange(live, "gone", 70000)).toBe("b");
    expect(tierAfterFormatChange(live, null, 1)).toBe("a");
    expect(tierAfterFormatChange([], "a", 1)).toBeNull();
  });

  it("offers gems for self-paced only", () => {
    expect(gemsApply("self_paced")).toBe(true);
    expect(gemsApply(null)).toBe(true);
    expect(gemsApply("group")).toBe(false);
    expect(gemsApply("one_to_one")).toBe(false);
  });
});
