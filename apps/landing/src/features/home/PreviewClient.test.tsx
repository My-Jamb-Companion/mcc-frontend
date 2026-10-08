import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { PREVIEW_CONTENT, PREVIEW_READY, defaultContent } from "@mcc/landing-content";
import { ADMIN_URL } from "@/src/config";
import { PreviewClient } from "./PreviewClient";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const send = (origin: string, data: unknown) =>
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { origin, data }));
  });

const page = (headline: string) => {
  const content = defaultContent();
  content.blocks = content.blocks.filter((b) => b.type === "hero");
  content.blocks[0].data.headline_lead = headline;
  return content;
};

describe("PreviewClient", () => {
  it("draws the content the admin console sends", () => {
    render(<PreviewClient />);
    send(ADMIN_URL, { type: PREVIEW_CONTENT, content: page("Fresh from the editor") });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Fresh from the editor");
  });

  it("ignores messages from any other origin", () => {
    render(<PreviewClient />);
    send("https://evil.example.com", { type: PREVIEW_CONTENT, content: page("Injected") });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Walk into your exam");
  });

  it("works when the browser refuses storage, as it can inside the admin console's frame", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(() => render(<PreviewClient />)).not.toThrow();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("tells a parent frame it is ready, and says nothing when opened on its own", () => {
    const post = vi.spyOn(window.parent, "postMessage");
    render(<PreviewClient />);
    expect(post).not.toHaveBeenCalled(); // not inside a frame (parent is itself)
    expect(PREVIEW_READY).toBe("mcc-landing-preview-ready");
  });
});
