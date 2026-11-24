import {describe, expect, it} from "vitest";
import {composePhone, splitPhone} from "./phone";
import {COUNTRIES, PHONE_CODE_OPTIONS, countryByName, flagOf} from "../constants/countries";

describe("composePhone", () => {
  it("puts the chosen country's code in front and drops the leading zero", () => {
    expect(composePhone("NG", "0801 234 5678")).toBe("+2348012345678");
    expect(composePhone("GH", "024 123 4567")).toBe("+233241234567");
    expect(composePhone("GB", "7911 123456")).toBe("+447911123456");
  });

  it("lets a full international number win over the chosen country", () => {
    expect(composePhone("NG", "+233 24 123 4567")).toBe("+233241234567");
    expect(composePhone("NG", "00233241234567")).toBe("+233241234567");
  });

  it("returns an empty string for nothing typed and null for what cannot be a number", () => {
    expect(composePhone("NG", "   ")).toBe("");
    expect(composePhone("NG", "12")).toBeNull();
    expect(composePhone("NG", "1".repeat(20))).toBeNull();
  });
});

describe("splitPhone", () => {
  it("finds the country from the code and returns the rest", () => {
    expect(splitPhone("+2348012345678")).toEqual({iso2: "NG", number: "8012345678"});
    expect(splitPhone("+233241234567")).toEqual({iso2: "GH", number: "241234567"});
  });

  it("prefers the learner's own country among countries that share a code", () => {
    expect(splitPhone("+14165550123", "CA")).toEqual({iso2: "CA", number: "4165550123"});
    expect(splitPhone("+14165550123")).toEqual({iso2: "US", number: "4165550123"});
  });

  it("shows a number saved without a code as it is", () => {
    expect(splitPhone("08012345678")).toEqual({iso2: "NG", number: "08012345678"});
    expect(splitPhone("", "GH")).toEqual({iso2: "GH", number: ""});
  });

  it("round-trips what composePhone makes", () => {
    for (const [iso2, typed] of [["NG", "0801 234 5678"], ["KE", "712 345 678"], ["US", "415 555 0123"]]) {
      const stored = composePhone(iso2, typed)!;
      const back = splitPhone(stored, iso2);
      expect(back.iso2).toBe(iso2);
      expect(composePhone(back.iso2, back.number)).toBe(stored);
    }
  });
});

describe("the country list", () => {
  it("covers every country, each once, with the common ones first", () => {
    expect(COUNTRIES.length).toBeGreaterThan(190);
    expect(new Set(COUNTRIES.map((c) => c.iso2)).size).toBe(COUNTRIES.length);
    expect(COUNTRIES.slice(0, 3).map((c) => c.name)).toEqual(["Nigeria", "Ghana", "Kenya"]);
  });

  it("keeps the countries that were offered before, by the same name", () => {
    for (const name of ["Nigeria", "Ghana", "Kenya"]) expect(countryByName(name)).toBeDefined();
  });

  it("has a phone code option for each country that a search by name or code can find", () => {
    expect(PHONE_CODE_OPTIONS).toHaveLength(COUNTRIES.length);
    const ng = PHONE_CODE_OPTIONS.find((o) => o.value === "NG")!;
    expect(ng.shortLabel).toBe("🇳🇬 +234");
    expect(ng.label).toContain("Nigeria");
    expect(ng.searchText).toContain("234");
  });

  it("makes a flag from an ISO code", () => {
    expect(flagOf("NG")).toBe("🇳🇬");
  });
});
