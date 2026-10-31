import {describe, expect, it} from "vitest";
import {POST_STATE, decisionCopy} from "./reportCopy";

describe("decisionCopy", () => {
  it("says what removing a post does, including the other reports it closes", () => {
    const copy = decisionCopy({content_type: "community_post", content_status: "hidden", pending_reports: 3});
    expect(copy.resolve.label).toBe("Remove post");
    expect(copy.resolve.text).toContain("2 other open reports");
    expect(copy.resolve.text).toContain("author is told");
    expect(copy.dismiss.label).toBe("Keep post");
    expect(copy.dismiss.text).toContain("goes back to the course");
  });

  it("uses the singular for one other report", () => {
    const copy = decisionCopy({content_type: "community_post", content_status: "held", pending_reports: 2});
    expect(copy.resolve.text).toContain("1 other open report on it");
  });

  it("does not promise to restore a post that is already showing", () => {
    const copy = decisionCopy({content_type: "community_post", content_status: "visible", pending_reports: 1});
    expect(copy.dismiss.label).toBe("Dismiss");
    expect(copy.dismiss.text).toContain("stays as it is");
    expect(copy.resolve.text).not.toContain("other open");
  });

  it("keeps the old wording for Q&A messages", () => {
    const copy = decisionCopy({content_type: "instructor_qa_message", content_status: null, pending_reports: 1});
    expect(copy.resolve.label).toBe("Resolve");
    expect(copy.dismiss.label).toBe("Dismiss");
  });

  it("describes every state a post can be in", () => {
    for (const state of ["visible", "held", "hidden", "removed"]) expect(POST_STATE[state].label).toBeTruthy();
    expect(POST_STATE.held.label).toContain("only its author");
  });
});
