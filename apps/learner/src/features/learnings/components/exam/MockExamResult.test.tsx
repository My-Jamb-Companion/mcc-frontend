import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";
import type {ApiMockResult} from "@/src/features/exams/services/exam.service";
import MockExamResult from "./MockExamResult";

vi.mock("@/src/features/brainy/hooks/useAiFeedback", () => ({useQuestionHelp: () => ({mutate: vi.fn(), isPending: false})}));
vi.mock("@/src/features/rewards/components/PointsEarnedCard", () => ({default: () => null}));

afterEach(cleanup);

const row = (id: string, text: string, over: Record<string, unknown> = {}) => ({
  question_id: id, question_text: text, question_type: "single_choice", options: ["a", "b"], your_answer: "a", correct_answer: "a",
  is_correct: true, explanation: null, seconds: 5, flagged: false, ...over,
});

const result = (rows: ReturnType<typeof row>[]): ApiMockResult => ({
  session_id: "s", finished: true, paper: {paper_id: "p", title: "Mock", duration_minutes: 30, passing_score: 50},
  score_percent: 100, correct: rows.length, total: rows.length, passed: true, seconds_used: 60, topic_breakdown: [], results: rows as never,
});

describe("MockExamResult with long-text questions", () => {
  it("shows the directions and a passage that can be opened, once for the questions that share it", () => {
    render(<MockExamResult onDone={vi.fn()} result={result([
      row("1", "First", {passage: "Shared passage text", instruction: "Directions here"}),
      row("2", "Second", {passage: "Shared passage text"}),
      row("3", "Third", {passage: "Another passage"}),
    ])} />);
    expect(screen.getByText("Directions here")).toBeInTheDocument();
    expect(screen.getAllByText("Show the passage")).toHaveLength(2);
    expect(screen.getByText("Same passage as the question above.")).toBeInTheDocument();
  });

  it("underlines marked text in the review", () => {
    const {container} = render(<MockExamResult onDone={vi.fn()} result={result([row("1", "He __kicked the bucket__")])} />);
    expect(Array.from(container.querySelectorAll("u")).map((u) => u.textContent)).toEqual(["kicked the bucket"]);
  });

  it("a question with no passage or directions looks as before", () => {
    render(<MockExamResult onDone={vi.fn()} result={result([row("1", "Plain")])} />);
    expect(screen.queryByText("Show the passage")).toBeNull();
  });
});
