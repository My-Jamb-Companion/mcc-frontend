import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({
  Icon: () => null,
  Button: ({children, onClick, disabled}: {children: React.ReactNode; onClick?: () => void; disabled?: boolean}) => (
    <button type="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));
vi.mock("@/src/features/brainy/services/brainy.service", () => ({sendChatMessage: vi.fn(), chatReplyText: vi.fn()}));

import InteractiveLessonContent from "./InteractiveLessonContent";

const HTML = "<h2>Flexible Time</h2><p>Time you control.</p><h2>The Matrix</h2><p>Urgent and important.</p>";

/** Pretend the device is (or isn't) a phone or tablet. */
function device(touch: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: touch,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe("a text lesson on a phone or tablet", () => {
  beforeEach(() => device(true));

  it("shows every section as its own page, with no Back or Next buttons", () => {
    render(<InteractiveLessonContent html={HTML} lessonTitle="Time" onComplete={() => {}} />);
    expect(screen.getByRole("heading", {name: "Flexible Time"})).toBeInTheDocument();
    expect(screen.getByRole("heading", {name: "The Matrix"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: /^Back$/})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: /^Next$/})).not.toBeInTheDocument();
    expect(screen.getByRole("region", {name: /swipe up/i})).toBeInTheDocument();
  });

  it("ends on a page with a Continue button that completes the lesson", () => {
    const onComplete = vi.fn();
    render(<InteractiveLessonContent html={HTML} lessonTitle="Time" onComplete={onComplete} />);
    expect(screen.getByText(/reached the end of this lesson/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: /Continue/}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("moves to the next page with the down arrow", () => {
    render(<InteractiveLessonContent html={HTML} lessonTitle="Time" onComplete={() => {}} />);
    fireEvent.keyDown(screen.getByRole("region"), {key: "ArrowDown"});
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  describe("full screen", () => {
    const fixedLayer = () => document.body.querySelector(".fixed.inset-0");

    it("offers Full screen, which covers the page with the lesson, and Exit full screen to come back", () => {
      render(<InteractiveLessonContent html={HTML} lessonTitle="Time" onComplete={() => {}} />);
      expect(screen.queryByRole("button", {name: "Exit full screen"})).not.toBeInTheDocument();
      expect(fixedLayer()).toBeNull();

      fireEvent.click(screen.getByRole("button", {name: "Full screen"}));
      expect(fixedLayer()).not.toBeNull();
      expect(screen.queryByRole("button", {name: "Full screen"})).not.toBeInTheDocument();
      expect(screen.getByRole("heading", {name: "The Matrix"})).toBeInTheDocument();
      expect(document.body.style.overflow).toBe("hidden");

      fireEvent.click(screen.getByRole("button", {name: "Exit full screen"}));
      expect(fixedLayer()).toBeNull();
      expect(document.body.style.overflow).not.toBe("hidden");
      expect(screen.getByRole("button", {name: "Full screen"})).toBeInTheDocument();
    });

    it("leaves full screen with Escape", () => {
      render(<InteractiveLessonContent html={HTML} lessonTitle="Time" onComplete={() => {}} />);
      fireEvent.click(screen.getByRole("button", {name: "Full screen"}));
      fireEvent.keyDown(document, {key: "Escape"});
      expect(fixedLayer()).toBeNull();
    });

    it("keeps the Continue button working in full screen", () => {
      const onComplete = vi.fn();
      render(<InteractiveLessonContent html={HTML} lessonTitle="Time" onComplete={onComplete} />);
      fireEvent.click(screen.getByRole("button", {name: "Full screen"}));
      fireEvent.click(screen.getByRole("button", {name: /Continue/}));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("says when a lesson has no content", () => {
    render(<InteractiveLessonContent html="" lessonTitle="Time" onComplete={() => {}} />);
    expect(screen.getByText(/no content yet/i)).toBeInTheDocument();
  });
});

describe("a text lesson on a desktop", () => {
  beforeEach(() => device(false));

  it("pages through sections with Back and Next, and Continue on the last", () => {
    const onComplete = vi.fn();
    render(<InteractiveLessonContent html={HTML} lessonTitle="Time" onComplete={onComplete} />);
    expect(screen.getByRole("heading", {name: "Flexible Time"})).toBeInTheDocument();
    expect(screen.queryByRole("heading", {name: "The Matrix"})).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {name: /Next/}));
    expect(screen.getByRole("heading", {name: "The Matrix"})).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {name: /Continue/}));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
