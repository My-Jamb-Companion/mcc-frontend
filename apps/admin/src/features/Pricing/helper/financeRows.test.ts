import {describe, expect, it} from "vitest";
import {financeRows, periods} from "./financeRows";
import type {ApiBreakdownTotals} from "../services/finance.service";

const totals = (patch: Partial<ApiBreakdownTotals> = {}): ApiBreakdownTotals => ({
  count: 0, amount: "0", vat: "0", gateway_fee: "0", referral_payout: "0", refund_reserve: "0",
  live_teaching: "0", direct_costs: {}, development_recovery: "0", overhead_recovery: "0",
  profit_before_tax: "0", income_tax_provision: "0", ...patch,
});

describe("financeRows", () => {
  it("nets refunds off sales bucket by bucket", () => {
    const rows = financeRows(totals({amount: "81000.00", vat: "5651.16"}), totals({amount: "40500.00", vat: "2825.58"}));
    const vat = rows.find((r) => r.key === "vat")!;
    expect(vat).toMatchObject({sales: 5651.16, refunds: 2825.58});
    expect(vat.net).toBeCloseTo(2825.58);
    expect(rows[0]).toMatchObject({label: "Paid by students (VAT included)", net: 40500});
  });

  it("lists every direct-cost category from either side, labelled", () => {
    const rows = financeRows(totals({direct_costs: {ai: "1000.00"}}), totals({direct_costs: {marking: "300.00"}}));
    const labels = rows.filter((r) => r.key.startsWith("direct-")).map((r) => [r.label, r.net]);
    expect(labels).toEqual([["AI usage", 1000], ["Mock exam marking", -300]]);
  });
});

describe("periods", () => {
  it("builds inclusive month, quarter and year ranges", () => {
    const p = periods(new Date(2026, 8, 17));
    expect(p["This month"]).toEqual(["2026-09-01", "2026-09-17"]);
    expect(p["Last month"]).toEqual(["2026-08-01", "2026-08-31"]);
    expect(p["This quarter"]).toEqual(["2026-07-01", "2026-09-17"]);
    expect(p["This year"]).toEqual(["2026-01-01", "2026-09-17"]);
  });

  it("crosses the year boundary in January", () => {
    expect(periods(new Date(2027, 0, 5))["Last month"]).toEqual(["2026-12-01", "2026-12-31"]);
  });
});
