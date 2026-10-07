// @vitest-environment jsdom
/**
 * "Insert symbol" opened a panel inside the editor's overflow-hidden frame, so only a
 * sliver showed and nothing could be picked. The panel must render outside that frame,
 * and choosing a symbol must put it into the editor.
 */
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

const insertText = vi.fn();
const setSelection = vi.fn();

// One stable fake editor: handing React a new one every render would loop (the editor
// root is kept in state).
const fakeEditor = {
  root: document.createElement("div"),
  getSelection: () => ({index: 3, length: 0}),
  getLength: () => 10,
  insertText,
  setSelection,
};

vi.mock("next/dynamic", async () => {
  const {useEffect} = await import("react");
  return {
    default: () =>
      function FakeQuill({forwardedRef}: {forwardedRef: (r: unknown) => void}) {
        useEffect(() => forwardedRef({getEditor: () => fakeEditor}), [forwardedRef]);
        return null;
      },
  };
});
vi.mock("@/src/features/courses/services/media.service", () => ({uploadMedia: vi.fn()}));

import LessonHtmlEditor from "./LessonHtmlEditor";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Insert symbol", () => {
  it("opens a panel outside the editor frame and inserts the chosen symbol", () => {
    const {container} = render(<LessonHtmlEditor value="" onChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", {name: /Insert symbol/}));

    const symbol = screen.getByRole("button", {name: "π"});
    expect(container.contains(symbol)).toBe(false); // portalled, so the frame can't clip it

    fireEvent.click(symbol);
    expect(insertText).toHaveBeenCalledWith(3, "π", "user");
    expect(screen.queryByRole("button", {name: "π"})).toBeNull(); // closes after picking
  });
});
