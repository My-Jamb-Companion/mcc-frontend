import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import type {ApiModuleQuestion, ApiModuleQuizResult} from "@/src/features/learnings/services/moduleQuiz.service";
import {CoursePractice} from "./CoursePractice";

const submitting = vi.hoisted(() => ({mutate: vi.fn()}));

vi.mock("@/src/features/learnings/hooks/useModuleQuiz", () => ({
  useSubmitModuleAnswers: () => ({mutate: submitting.mutate, isPending: false}),
}));
vi.mock("@/src/features/brainy/hooks/useAiFeedback", () => ({
  useAnalysis: () => ({mutate: vi.fn(), isPending: false}),
  useQuestionHelp: () => ({mutate: vi.fn(), isPending: false}),
}));
vi.mock("@/src/features/learnings/helper/helper", () => ({shuffleArray: <T,>(a: T[]) => a}));
vi.mock("@/src/features/rewards/components/PointsEarnedCard", () => ({default: () => null}));

const question: ApiModuleQuestion = {
  question_id: "q1", question_text: "What is the primary focus of Pilates?", question_type: "single_choice",
  options: ["Isolated muscles", "Controlled movement"], correct_answers: ["Controlled movement"], explanation: "Core control.",
} as ApiModuleQuestion;

const graded: ApiModuleQuizResult = {
  score_percent: 100, graded_count: 1, passed: null, passing_score: null,
  results: [{
    question_id: "q1", your_answer: ["Controlled movement"], correct_answer: ["Controlled movement"], is_correct: true,
    explanation: "Core control.", option_feedback: ["Pilates is whole-body, not isolated.", "Right: controlled, low-impact movement."],
  }],
};

afterEach(() => {
  cleanup();
  submitting.mutate.mockReset();
});

describe("CoursePractice as a Test", () => {
  it("opens with an intro, then the first question", () => {
    render(<CoursePractice courseId="c1" moduleId="m1" questions={[question]} label="Test" passingScore={60} showIntro />);
    expect(screen.getByText("Time for a Course test?")).toBeInTheDocument();
    expect(screen.getByText(/1 question/)).toBeInTheDocument();
    expect(screen.getByText("Pass mark: 60%")).toBeInTheDocument();
    expect(screen.queryByText(question.question_text)).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
    expect(screen.getByText(question.question_text)).toBeInTheDocument();
  });

  it("goes straight to the questions without the intro prop", () => {
    render(<CoursePractice courseId="c1" moduleId="m1" questions={[question]} />);
    expect(screen.getByText(question.question_text)).toBeInTheDocument();
  });

  it("holds the per-option responses back while playing and shows them in the review", async () => {
    submitting.mutate.mockImplementation((_answers, opts) => opts.onSuccess(graded));
    render(<CoursePractice courseId="c1" moduleId="m1" questions={[question]} label="Test" />);
    expect(screen.queryByText(/whole-body/)).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: /Controlled movement/}));
    fireEvent.click(screen.getByRole("button", {name: /Submit/}));
    fireEvent.click(await screen.findByRole("button", {name: "Review"}));
    expect(await screen.findByText("Pilates is whole-body, not isolated.")).toBeInTheDocument();
    expect(screen.getByText("Right: controlled, low-impact movement.")).toBeInTheDocument();
  });
});
