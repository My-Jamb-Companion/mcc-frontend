import {describe, expect, it, vi} from "vitest";

vi.mock("@mcc/ui", () => ({ConfirmModal: () => null, Icon: () => null, Modal: () => null, showError: vi.fn(), showSuccess: vi.fn()}));
vi.mock("../hooks/useQaTesters", () => ({}));

import {formatWhen} from "./QaTesters";

describe("formatWhen", () => {
  it("says Never when there is no login", () => {
    expect(formatWhen(null)).toBe("Never");
    expect(formatWhen("not a date")).toBe("Never");
  });

  it("formats a real date", () => {
    expect(formatWhen("2026-11-05T10:00:00Z")).toMatch(/2026/);
  });
});
