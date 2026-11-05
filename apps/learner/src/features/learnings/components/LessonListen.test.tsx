import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import type {AudioManifest} from "../helper/lessonAudio";

vi.mock("@mcc/ui", () => ({Icon: () => null}));

const manifestState: {data: AudioManifest | undefined} = {data: undefined};
vi.mock("../hooks/useLessonAudioManifest", () => ({useLessonAudioManifest: () => manifestState}));

const reader = {
  status: "idle" as "idle" | "loading" | "playing" | "paused" | "error",
  section: null as number | null,
  speed: 1,
  error: null as string | null,
  playFrom: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
  setSpeed: vi.fn(),
};
let onSection: (s: number) => void = () => {};
vi.mock("../hooks/useLessonReader", () => ({
  useLessonReader: (opts: {onSection: (s: number) => void}) => {
    onSection = opts.onSection;
    return reader;
  },
}));

import LessonListen from "./LessonListen";

const sec = (index: number) => ({index, heading: `H${index}`, parts: 1, chars: 100});
const target = {kind: "course" as const, parentId: "c1", lectureId: "l1"};

beforeEach(() => {
  manifestState.data = {available: true, sections: [sec(0), sec(1), sec(2)]};
  Object.assign(reader, {status: "idle", section: null, speed: 1, error: null});
  Object.values(reader).forEach((v) => typeof v === "function" && (v as ReturnType<typeof vi.fn>).mockClear());
});
afterEach(cleanup);

describe("LessonListen", () => {
  it("offers nothing when the lesson cannot be spoken", () => {
    manifestState.data = {available: false, sections: []};
    const {container} = render(<LessonListen {...target} pages={3} page={0} onGoToPage={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("offers nothing when the sections do not line up with the pages", () => {
    const {container} = render(<LessonListen {...target} pages={4} page={0} onGoToPage={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("starts from the page being read", () => {
    render(<LessonListen {...target} pages={3} page={1} onGoToPage={() => {}} />);
    fireEvent.click(screen.getByRole("button", {name: /Listen to this lesson/}));
    expect(reader.playFrom).toHaveBeenCalledWith(1);
  });

  it("shows the player while listening, with pause, section and speed controls", () => {
    reader.status = "playing";
    reader.section = 1;
    render(<LessonListen {...target} pages={3} page={1} onGoToPage={() => {}} />);
    expect(screen.getByText("Section 2 of 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Pause"}));
    expect(reader.pause).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Next section"}));
    expect(reader.playFrom).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole("button", {name: "Previous section"}));
    expect(reader.playFrom).toHaveBeenCalledWith(0);
    fireEvent.click(screen.getByRole("button", {name: /Change speed/}));
    expect(reader.setSpeed).toHaveBeenCalledWith(1.25);
    fireEvent.click(screen.getByRole("button", {name: "Stop listening"}));
    expect(reader.stop).toHaveBeenCalled();
  });

  it("resumes a paused lesson and offers a retry after an error", () => {
    reader.status = "paused";
    reader.section = 0;
    const {rerender} = render(<LessonListen {...target} pages={3} page={0} onGoToPage={() => {}} />);
    fireEvent.click(screen.getByRole("button", {name: "Play"}));
    expect(reader.resume).toHaveBeenCalled();
    reader.status = "error";
    reader.error = "Listening is paused for today.";
    rerender(<LessonListen {...target} pages={3} page={0} onGoToPage={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("paused for today");
    fireEvent.click(screen.getByRole("button", {name: "Try again"}));
    expect(reader.playFrom).toHaveBeenCalledWith(0);
  });

  it("carries on from the page the learner turns to, but not from the page the audio turned to itself", () => {
    reader.status = "playing";
    reader.section = 0;
    const {rerender} = render(<LessonListen {...target} pages={3} page={0} onGoToPage={() => {}} />);
    reader.playFrom.mockClear();
    // The audio moved on by itself: the page follows, and that is not a new request.
    onSection(1);
    rerender(<LessonListen {...target} pages={3} page={1} onGoToPage={() => {}} />);
    expect(reader.playFrom).not.toHaveBeenCalled();
    // The learner turns the page.
    rerender(<LessonListen {...target} pages={3} page={2} onGoToPage={() => {}} />);
    expect(reader.playFrom).toHaveBeenCalledWith(2);
  });

  it("stops when the learner reaches the closing page", () => {
    reader.status = "playing";
    reader.section = 2;
    const {rerender} = render(<LessonListen {...target} pages={3} page={2} onGoToPage={() => {}} />);
    rerender(<LessonListen {...target} pages={3} page={3} onGoToPage={() => {}} />);
    expect(reader.stop).toHaveBeenCalled();
  });
});
