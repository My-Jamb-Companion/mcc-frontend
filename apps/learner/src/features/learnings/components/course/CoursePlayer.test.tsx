import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Icon: () => null}));

import CoursePlayer from "./CoursePlayer";

afterEach(() => {
  cleanup();
  delete (Element.prototype as {requestFullscreen?: unknown}).requestFullscreen;
});

describe("the video player's full screen", () => {
  it("takes the whole player full screen where the browser allows it", () => {
    const requestFullscreen = vi.fn(() => Promise.resolve());
    Element.prototype.requestFullscreen = requestFullscreen;
    render(<CoursePlayer src="https://cdn/x/a.mp4" />);
    fireEvent.click(screen.getByRole("button", {name: "Full screen"}));
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("falls back to the video's own full screen on an iPhone, which has none for other elements", () => {
    const enter = vi.fn();
    (HTMLVideoElement.prototype as unknown as {webkitEnterFullscreen: () => void}).webkitEnterFullscreen = enter;
    const {container} = render(<CoursePlayer src="https://cdn/x/a.mp4" />);
    expect(container.querySelector("video")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", {name: "Full screen"}));
    expect(enter).toHaveBeenCalledTimes(1);
  });

  it("does not throw when the browser has no full screen at all", () => {
    render(<CoursePlayer src="https://cdn/x/a.mp4" />);
    expect(() => fireEvent.click(screen.getByRole("button", {name: "Full screen"}))).not.toThrow();
  });
});
