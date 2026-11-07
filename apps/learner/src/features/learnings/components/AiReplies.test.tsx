import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Button: () => null, Icon: () => null, BrainyMark: () => null}));
vi.mock("@/src/features/brainy/services/brainy.service", () => ({chatReplyText: (r: {reply: string}) => r.reply, sendChatMessage: vi.fn()}));

import MarkdownMessage from "@/src/features/brainy/components/MarkdownMessage";

afterEach(cleanup);

// What Brainy sends back for "Ask about this section" and "Get AI feedback": Markdown, which must show as formatted text.
describe("Brainy replies in lessons and results", () => {
  it("shows bold, headings and lists as formatted text, not as raw asterisks and hashes", () => {
    const reply = "the **cover test** is quick.\n\n### How to use it\n\n1. **Cover the topic sentence**\n2. Read the rest";
    const {container} = render(<MarkdownMessage content={reply} />);
    expect(container.querySelector("strong")?.textContent).toBe("cover test");
    expect(screen.getByRole("heading", {name: "How to use it"})).toBeTruthy();
    expect(container.querySelectorAll("ol > li")).toHaveLength(2);
    expect(container.textContent).not.toMatch(/\*\*|###/);
  });

  it("does not render embedded HTML from a reply", () => {
    const {container} = render(<MarkdownMessage content={"hello <img src=x onerror=alert(1)>"} />);
    expect(container.querySelector("img")).toBeNull();
  });
});
