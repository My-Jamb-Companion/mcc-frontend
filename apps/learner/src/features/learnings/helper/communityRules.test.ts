import {describe, expect, it} from "vitest";
import {canReport, counterText, overLimit, reportReasonLabel, reviewNotice, REPORT_REASONS} from "./communityRules";

describe("counterText", () => {
  it("stays quiet until the limit is close", () => {
    expect(counterText(100, 2000)).toBeNull();
    expect(counterText(1499, 2000)).toBeNull();
    expect(counterText(1500, 2000)).toBe("1500 / 2000");
    expect(counterText(2000, 2000)).toBe("2000 / 2000");
  });
  it("knows when a post is too long", () => {
    expect(overLimit(2000, 2000)).toBe(false);
    expect(overLimit(2001, 2000)).toBe(true);
  });
});

describe("reviewNotice", () => {
  it("tells the author their held or hidden post is waiting, and nobody else", () => {
    expect(reviewNotice({status: "held", is_mine: true})).toContain("Waiting for a moderator");
    expect(reviewNotice({status: "hidden", is_mine: true})).toContain("Hidden while a moderator");
    expect(reviewNotice({status: "held", is_mine: false})).toBeNull();
    expect(reviewNotice({status: "visible", is_mine: true})).toBeNull();
    expect(reviewNotice({is_mine: true})).toBeNull();
  });
});

describe("canReport", () => {
  it("lets people report other people's visible posts only", () => {
    expect(canReport({status: "visible", is_mine: false})).toBe(true);
    expect(canReport({is_mine: false})).toBe(true);
    expect(canReport({status: "visible", is_mine: true})).toBe(false);
    expect(canReport({status: "held", is_mine: false})).toBe(false);
  });
});

describe("report reasons", () => {
  it("covers the things a moderator triages on, with a fallback", () => {
    expect(REPORT_REASONS.map((r) => r.value)).toEqual(["off_topic", "abuse", "exam_leak", "contact", "other"]);
    expect(reportReasonLabel("exam_leak")).toBe("Exam leak or cheating");
    expect(reportReasonLabel("nonsense")).toBe("Something else");
  });
});
