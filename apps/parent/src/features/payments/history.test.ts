import { describe, expect, it } from "vitest";
import { formatMoney, hasReceipt, paymentTitle } from "./history";

describe("payment history helpers", () => {
  it("formats naira and other currencies", () => {
    expect(formatMoney("15000.00")).toBe("₦15,000");
    expect(formatMoney(2500.5)).toBe("₦2,500.5");
    expect(formatMoney(10, "USD")).toBe("USD 10");
  });
  it("only paid or refunded payments have a receipt", () => {
    expect(hasReceipt("successful")).toBe(true);
    expect(hasReceipt("refunded")).toBe(true);
    expect(hasReceipt("pending")).toBe(false);
    expect(hasReceipt("failed")).toBe(false);
  });
  it("names what was bought", () => {
    expect(paymentTitle({ item: "Algebra", purpose: "course_enrollment" })).toBe("Algebra");
    expect(paymentTitle({ item: null, purpose: "gems" })).toBe("Gems");
    expect(paymentTitle({ item: null, purpose: "exam_access" })).toBe("Exam prep program");
  });
});
