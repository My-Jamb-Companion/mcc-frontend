import {describe, it, expect} from "vitest";
import {computeFinancialHealth} from "./finance.mapper";
import {MonthlyFlowDatum} from "../IncomeAndPayouts";

function flow(entries: Array<[string, number, number]>): MonthlyFlowDatum[] {
  return entries.map(([month, income, payout]) => ({month, income, payout}));
}

describe("computeFinancialHealth", () => {
  it("computes net, saved percent and change against the previous month", () => {
    const result = computeFinancialHealth(
      flow([
        ["Jun", 100_000, 60_000], // net 40,000
        ["Jul", 100_000, 44_000], // net 56,000
      ]),
    );

    expect(result.netThisMonth).toBe(56_000);
    expect(result.savedPercent).toBe(56);
    expect(result.isHealthy).toBe(true);
    // (56,000 - 40,000) / 40,000 = 40%
    expect(result.changePercent).toBe(40);
  });

  it("flags an unhealthy month when payout exceeds income", () => {
    const result = computeFinancialHealth(
      flow([
        ["Jun", 100_000, 60_000],
        ["Jul", 50_000, 70_000], // net -20,000
      ]),
    );

    expect(result.netThisMonth).toBe(-20_000);
    expect(result.isHealthy).toBe(false);
    expect(result.savedPercent).toBe(-40);
  });

  it("treats zero income as zero saved percent rather than dividing by zero", () => {
    const result = computeFinancialHealth(flow([["Jul", 0, 0]]));
    expect(result.savedPercent).toBe(0);
    expect(result.isHealthy).toBe(true);
  });

  it("returns all zeros for an empty series instead of throwing", () => {
    const result = computeFinancialHealth([]);
    expect(result).toEqual({
      netThisMonth: 0,
      changePercent: 0,
      savedPercent: 0,
      isHealthy: true,
    });
  });

  it("treats a zero-net previous month as a 100% swing when this month turns positive", () => {
    const result = computeFinancialHealth(
      flow([
        ["Jun", 10_000, 10_000], // net 0
        ["Jul", 10_000, 5_000], // net 5,000
      ]),
    );
    expect(result.changePercent).toBe(100);
  });

  it("treats a zero-net previous month as no change when this month is also flat or negative", () => {
    const result = computeFinancialHealth(
      flow([
        ["Jun", 10_000, 10_000], // net 0
        ["Jul", 10_000, 10_000], // net 0
      ]),
    );
    expect(result.changePercent).toBe(0);
  });
});
