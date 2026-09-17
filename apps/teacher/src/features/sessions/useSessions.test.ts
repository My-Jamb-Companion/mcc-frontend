import { describe, expect, it, vi } from "vitest";

vi.mock("@mcc/ui", () => ({ showError: vi.fn(), showSuccess: vi.fn() }));

import { deliveryMessage } from "./useSessions";

const result = (patch = {}) => ({
  enrolments_paid: 0,
  amount_credited: "0",
  enrolments_with_budget_used_up: 0,
  legacy_enrolments: 0,
  ...patch,
});

describe("deliveryMessage", () => {
  it("says what was added and for how many students", () => {
    expect(deliveryMessage(result({ enrolments_paid: 1, amount_credited: "1250.00" }))).toBe(
      `Marked delivered. ₦${(1250).toLocaleString()} added to your earnings for 1 student.`,
    );
    expect(deliveryMessage(result({ enrolments_paid: 3, amount_credited: "3750" }))).toContain("3 students");
  });

  it("explains why nothing was added", () => {
    expect(deliveryMessage(result({ enrolments_with_budget_used_up: 1 }))).toContain("already used");
    expect(deliveryMessage(result({ legacy_enrolments: 2 }))).toContain("paid for when they bought");
    expect(deliveryMessage(result())).toContain("No paid enrolments");
  });
});
