import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";
import ReadinessCard from "./ReadinessCard";

const state = vi.hoisted(() => ({data: undefined as unknown}));
vi.mock("@/src/features/exams/hooks/useExams", () => ({useReadinessOverview: () => ({data: state.data})}));

afterEach(() => {
  cleanup();
  state.data = undefined;
});

describe("ReadinessCard", () => {
  it("shows nothing before there is anything to show", () => {
    const {container} = render(<ReadinessCard />);
    expect(container).toBeEmptyDOMElement();
    state.data = [];
    const again = render(<ReadinessCard />);
    expect(again.container).toBeEmptyDOMElement();
  });

  it("shows each program's readiness and predicted range, linking to the program", () => {
    state.data = [
      {program_id: "p1", exam_name: "JAMB", subject_name: "Maths", readiness_percent: 43, answered: 40,
       predicted: {available: true, low: 62, high: 71, confidence: "medium", answered: 40, needed: 15, message: null}},
      {program_id: "p2", exam_name: "WAEC", subject_name: "English", readiness_percent: 0, answered: 0,
       predicted: {available: false, low: null, high: null, confidence: null, answered: 0, needed: 15, message: "Answer 15 more questions to see a predicted score."}},
    ];
    render(<ReadinessCard />);
    expect(screen.getByRole("link", {name: /JAMB — Maths/})).toHaveAttribute("href", "/learnings/exams/p1");
    expect(screen.getByText("43%")).toBeInTheDocument();
    expect(screen.getByText("62% – 71%")).toBeInTheDocument();
    expect(screen.getByText("Answer 15 more questions to see a predicted score.")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", {name: "JAMB — Maths readiness"})).toHaveAttribute("aria-valuenow", "43");
  });
});
