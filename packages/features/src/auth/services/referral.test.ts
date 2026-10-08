import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { captureReferralCode } from "./referral";

const visit = (search: string) => window.history.replaceState({}, "", `/signup${search}`);

describe("captureReferralCode", () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => visit(""));

  it("reads the code from the invite link", () => {
    visit("?ref=mcc-123");
    expect(captureReferralCode()).toBe("mcc-123");
  });

  it("keeps it for the rest of the visit, after the link's query is gone", () => {
    visit("?ref=mcc-123");
    captureReferralCode();
    visit("");
    expect(captureReferralCode()).toBe("mcc-123");
  });

  it("is undefined when there was no invite", () => {
    visit("");
    expect(captureReferralCode()).toBeUndefined();
  });

  it("still works when storage is blocked", () => {
    visit("?ref=mcc-9");
    const original = window.sessionStorage.getItem;
    Storage.prototype.getItem = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    try {
      expect(captureReferralCode()).toBe("mcc-9");
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
