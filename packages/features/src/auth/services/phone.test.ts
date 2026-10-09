import { describe, expect, it } from "vitest";
import { toE164 } from "./phone";

describe("toE164", () => {
  it("turns local Nigerian numbers into E.164", () => {
    expect(toE164("08012345678")).toBe("+2348012345678");
    expect(toE164("0801 234 5678")).toBe("+2348012345678");
    expect(toE164("8012345678")).toBe("+2348012345678");
  });
  it("keeps numbers that already carry a country code", () => {
    expect(toE164("+234 (801) 234-5678")).toBe("+2348012345678");
    expect(toE164("2348012345678")).toBe("+2348012345678");
    expect(toE164("0044 7911 123456")).toBe("+447911123456");
    expect(toE164("+1 415 555 2671")).toBe("+14155552671");
  });
  it("rejects what cannot be a number", () => {
    expect(toE164("")).toBeNull();
    expect(toE164("abc")).toBeNull();
    expect(toE164("0801")).toBeNull();
    expect(toE164("+1234567890123456789")).toBeNull();
  });
});
