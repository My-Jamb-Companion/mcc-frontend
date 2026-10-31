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

import {FEED_MODES, answersLabel, canAccept, canVote, errorCode} from "./communityRules";

describe("errorCode", () => {
  it("reads the server's code, and nothing else", () => {
    expect(errorCode({response: {data: {error: {code: "GUIDELINES_REQUIRED"}}}})).toBe("GUIDELINES_REQUIRED");
    expect(errorCode({response: {data: {}}})).toBeNull();
    expect(errorCode(new Error("boom"))).toBeNull();
    expect(errorCode(null)).toBeNull();
  });
});

describe("answersLabel", () => {
  it("counts answers and invites the first one", () => {
    expect(answersLabel(0)).toBe("Be first to answer");
    expect(answersLabel(1)).toBe("1 answer");
    expect(answersLabel(5)).toBe("5 answers");
  });
});

describe("who can vote and accept", () => {
  it("only votes on other people's showing posts", () => {
    expect(canVote({is_mine: false, status: "visible"})).toBe(true);
    expect(canVote({is_mine: true, status: "visible"})).toBe(false);
    expect(canVote({is_mine: false, status: "held"})).toBe(false);
  });
  it("only the asker accepts, from here", () => {
    expect(canAccept({is_mine: true})).toBe(true);
    expect(canAccept({is_mine: false})).toBe(false);
  });
  it("offers three ways to sort", () => {
    expect(FEED_MODES.map((m) => m.value)).toEqual(["new", "top", "unanswered"]);
  });
});
