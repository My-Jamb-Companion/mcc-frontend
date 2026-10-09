import {describe, expect, it} from "vitest";
import {formatCompactNaira, formatNaira, toOverviewCards} from "./overview";
import type {ApiFinanceOverview} from "../services/finance.service";

const api = (over: Partial<ApiFinanceOverview> = {}): ApiFinanceOverview => ({
  period: {key: "this_month", start: null, end: null},
  collected: {
    total: "17000.00", payments: 3, by_method: {card: "10000.00", transfer: "6000.00", other: "1000.00"},
    by_purpose: {course: "10000.00", exam: "6000.00", gems: "1000.00"}, refunded: "4000.00",
  },
  teachers: {earned: "9500.00", paid_out: "2500.00", owed_now: "7000.00", pending_requests: "0.00"},
  left_for_mcc: "8000.00",
  ...over,
});

describe("overview formatting", () => {
  it("formats naira without fractions, and compactly for breakdowns", () => {
    expect(formatNaira("200211503.00")).toBe("₦200,211,503");
    expect(formatCompactNaira(20_800_000)).toBe("₦20.8m");
    expect(formatCompactNaira(70_000)).toBe("₦70.0k");
    expect(formatCompactNaira("950")).toBe("₦950");
    expect(formatNaira(null)).toBe("₦0");
    expect(formatNaira("not a number")).toBe("₦0");
  });

  it("turns the API figures into the three cards", () => {
    const cards = toOverviewCards(api());
    expect(cards.collected).toMatchObject({total: "₦17,000", payments: 3, card: "₦10.0k", transfer: "₦6,000", other: "₦1,000", refunded: "₦4,000"});
    expect(cards.income).toMatchObject({course: "₦10.0k", exam: "₦6,000", gems: "₦1,000", leftForMcc: "₦8,000"});
    expect(cards.teachers).toMatchObject({earned: "₦9,500", paidOut: "₦2,500", owed: "₦7,000", pending: null});
  });

  it("hides lines that would only say zero", () => {
    const cards = toOverviewCards(api({
      collected: {total: 0, payments: 0, by_method: {card: 0, transfer: 0, other: 0}, by_purpose: {course: 0, exam: 0, gems: 0}, refunded: 0},
      teachers: {earned: 0, paid_out: 0, owed_now: 0, pending_requests: "1500"},
    }));
    expect(cards.collected.other).toBeNull();
    expect(cards.collected.refunded).toBeNull();
    expect(cards.teachers.pending).toBe("₦1,500");
  });
});
