import {describe, expect, it} from "vitest";
import {allowanceSummary, describeCharge, isAllowanceUsed} from "./charge";

const charge = (patch = {}) => ({
  free_tokens: 0, allowance_tokens: 0, gem_tokens: 0, gems_charged: 0, gems_short: 0, ...patch,
});

describe("describeCharge", () => {
  it("names what paid for the answer", () => {
    expect(describeCharge(charge({free_tokens: 400}))).toBe("Free");
    expect(describeCharge(charge({allowance_tokens: 900}))).toBe("Allowance");
    expect(describeCharge(charge({gem_tokens: 600, gems_charged: 1}))).toBe("1 gem");
    expect(describeCharge(charge({free_tokens: 200, gem_tokens: 600, gems_charged: 2}))).toBe("Free + 2 gems");
  });

  it("says when the gems ran out, and nothing when unmetered", () => {
    expect(describeCharge(charge({gem_tokens: 600, gems_short: 2}))).toBe("out of gems");
    expect(describeCharge(null)).toBeNull();
  });
});

describe("allowanceSummary", () => {
  const base = {
    metered: true, free_left_today: 3200, monthly_allowance_tokens: 0, allowance_left_this_month: 0,
    gems: 12, earned_gems: 5, purchased_gems: 7,
  };

  it("leaves out the monthly allowance for students without a paid course", () => {
    expect(allowanceSummary(base)).toBe("3.2K free tokens left today · 12 gems");
  });

  it("includes it when they have one", () => {
    expect(allowanceSummary({...base, monthly_allowance_tokens: 66137, allowance_left_this_month: 61000, gems: 1}))
      .toBe("3.2K free tokens left today · 61K left this month · 1 gem");
  });

  it("is empty when Brainy isn't metered", () => {
    expect(allowanceSummary({...base, metered: false})).toBeNull();
  });
});

describe("isAllowanceUsed", () => {
  it("recognises the 402 refusal", () => {
    expect(isAllowanceUsed({response: {status: 402}})).toBe(true);
    expect(isAllowanceUsed({response: {status: 400, data: {error: {code: "BRAINY_ALLOWANCE_USED"}}}})).toBe(true);
    expect(isAllowanceUsed({response: {status: 500}})).toBe(false);
    expect(isAllowanceUsed(new Error("offline"))).toBe(false);
  });
});
