import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import type {ApiProgramReadiness} from "@/src/features/exams/services/exam.service";
import ReadinessPanel from "./ReadinessPanel";

afterEach(cleanup);

const readiness: ApiProgramReadiness = {
  program_id: "p1", readiness_percent: 43, answered: 3, total: 7,
  predicted: {available: false, low: null, high: null, confidence: null, answered: 3, needed: 15, message: "Answer 12 more questions to see a predicted score."},
  weakest: [{node_type: "module", node_id: "m2", title: "Module B", level: "attempted", score: 0.1, lecture_id: "l2"}],
  levels: {ready: 1, not_started: 2},
  units: [{
    sub_topic_id: "s1", title: "Unit 1", topic_title: "Algebra",
    tiles: [
      {node_type: "module", node_id: "m1", title: "Module A", level: "ready", score: 1, answered: 3, total: 3},
      {node_type: "module", node_id: "m2", title: "Module B", level: "attempted", score: 0.1, answered: 1, total: 2},
      {node_type: "sub_topic", node_id: "s1", title: "Unit exercise", level: "not_started", score: 0, answered: 0, total: 2},
    ],
  }],
};

const setup = (over: Partial<ApiProgramReadiness> = {}) => {
  const onPractise = vi.fn();
  const onOpenLecture = vi.fn();
  render(<ReadinessPanel readiness={{...readiness, ...over}} onPractise={onPractise} onOpenLecture={onOpenLecture} />);
  return {onPractise, onOpenLecture};
};

describe("ReadinessPanel", () => {
  it("shows Exam Readiness and says why there is no predicted score yet", () => {
    setup();
    expect(screen.getByText(/Exam readiness: 43%/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", {name: "Exam readiness"})).toHaveAttribute("aria-valuenow", "43");
    expect(screen.getByText("Answer 12 more questions to see a predicted score.")).toBeInTheDocument();
  });

  it("shows the predicted range with a note on how far to trust it", () => {
    setup({predicted: {available: true, low: 62, high: 71, confidence: "low", answered: 20, needed: 15, message: null}});
    expect(screen.getByText("62% – 71%")).toBeInTheDocument();
    expect(screen.getByText(/Early estimate/)).toBeInTheDocument();
  });

  it("keeps the tiles tucked away until asked, then draws one per topic with a legend", () => {
    setup();
    expect(screen.queryByRole("button", {name: /Module A: Ready/})).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: /Show topic levels/}));
    expect(screen.getByText("Unit 1")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Module A: Ready (3 of 3 questions played)"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /Unit exercise: Not started/})).toBeInTheDocument();
    expect(screen.getByRole("list", {name: "Levels"})).toHaveTextContent("Proficient");
    fireEvent.click(screen.getByRole("button", {name: /Hide topic levels/}));
    expect(screen.queryByText("Unit 1")).toBeNull();
  });

  it("practises the topic of a tile that is clicked", () => {
    const {onPractise} = setup();
    fireEvent.click(screen.getByRole("button", {name: /Show topic levels/}));
    fireEvent.click(screen.getByRole("button", {name: /Module B: Attempted/}));
    expect(onPractise).toHaveBeenCalledWith(expect.objectContaining({node_type: "module", node_id: "m2"}));
  });

  it("offers the weakest topics with a lesson to revisit and a way to practise", () => {
    const {onPractise, onOpenLecture} = setup();
    expect(screen.getByText("Practise these next")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Revisit the lesson"}));
    expect(onOpenLecture).toHaveBeenCalledWith("l2");
    fireEvent.click(screen.getByRole("button", {name: "Practise"}));
    expect(onPractise).toHaveBeenCalledWith(expect.objectContaining({node_id: "m2"}));
  });

  it("has no weak-topics list when nothing is weak", () => {
    setup({weakest: []});
    expect(screen.queryByText("Practise these next")).toBeNull();
  });
});
