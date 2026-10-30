import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import type {ApiModuleQuestion, ApiModuleQuizResult} from "@/src/features/learnings/services/moduleQuiz.service";
import {CoursePractice} from "./CoursePractice";

const submitting = vi.hoisted(() => ({mutate: vi.fn()}));
const sounds = vi.hoisted(() => ({play: vi.fn(), unlock: vi.fn(), buzz: vi.fn()}));
vi.mock("@mcc/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mcc/ui")>()),
  confettiCelebrate: vi.fn(),
}));
vi.mock("@/src/features/smart-zone/sound/engine", () => ({
  playSound: sounds.play, unlockAudio: sounds.unlock, buzz: sounds.buzz,
}));

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
  Object.values(sounds).forEach((f) => f.mockReset());
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

const second: ApiModuleQuestion = {
  question_id: "q2", question_text: "Which year did it start?", question_type: "single_choice",
  options: ["1920", "1926", "1930"], correct_answers: ["1926"], explanation: null,
} as ApiModuleQuestion;

const played = () => sounds.play.mock.calls.map((c) => c[0]);
const key = (k: string, init: KeyboardEventInit = {}) => fireEvent.keyDown(window, {key: k, ...init});

describe("CoursePractice as a Smart Zone", () => {
  const zone = (extra: Record<string, unknown> = {}) =>
    render(<CoursePractice courseId="c1" moduleId="m1" questions={[question, second]} label="Smart Zone" smartZone {...extra} />);

  it("opens with the Smart Zone intro and starts on the button or Enter", () => {
    zone({timerMinutes: 5});
    expect(screen.getByText("Ready for the Smart Zone?")).toBeInTheDocument();
    expect(screen.getByText(/5 min on the clock/)).toBeInTheDocument();
    expect(screen.queryByText(question.question_text)).toBeNull();
    key("Enter");
    expect(screen.getByText(question.question_text)).toBeInTheDocument();
    expect(sounds.unlock).toHaveBeenCalled();
  });

  it("shows the countdown ring only when the Smart Zone is timed", () => {
    zone({timerMinutes: 5});
    fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
    expect(screen.getByRole("timer")).toHaveTextContent("5:00");
    cleanup();
    zone();
    fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
    expect(screen.queryByRole("timer")).toBeNull();
  });

  it("answers from the keyboard with sounds: letter picks, Enter goes on", () => {
    zone();
    key("Enter");
    key("b");
    expect(screen.getByRole("button", {name: /Controlled movement/})).toBeInTheDocument();
    expect(played()).toContain("select");
    key("Enter");
    expect(screen.getByText(second.question_text)).toBeInTheDocument();
    expect(played()).toContain("next");
  });

  it("does not move on until an answer is chosen", () => {
    zone();
    key("Enter");
    key("Enter");
    expect(screen.getByText(question.question_text)).toBeInTheDocument();
  });

  it("submits on Enter at the last question, with the finish fanfare for a good score", () => {
    submitting.mutate.mockImplementation((_answers, opts) => opts.onSuccess({...graded, score_percent: 100}));
    zone();
    key("Enter");
    key("b"); key("Enter");
    key("2"); key("Enter");
    expect(submitting.mutate).toHaveBeenCalledWith({q1: ["Controlled movement"], q2: ["1926"]}, expect.anything());
    expect(played()).toEqual(expect.arrayContaining(["enter", "complete"]));
  });

  it("uses the gentle sound for a low score", () => {
    submitting.mutate.mockImplementation((_answers, opts) => opts.onSuccess({...graded, score_percent: 0}));
    zone();
    key("Enter");
    key("a"); key("Enter");
    key("a"); key("Enter");
    expect(played()).toContain("consolation");
  });

  it("sounds each question's verdict while reviewing, and Prev works with P", async () => {
    submitting.mutate.mockImplementation((_answers, opts) =>
      opts.onSuccess({
        ...graded, graded_count: 2,
        results: [
          graded.results[0],
          {question_id: "q2", your_answer: ["1920"], correct_answer: ["1926"], is_correct: false, explanation: null, option_feedback: null},
        ],
      }),
    );
    zone();
    key("Enter");
    key("b"); key("Enter");
    key("a"); key("Enter");
    fireEvent.click(await screen.findByRole("button", {name: "Review"}));
    expect(played()).toContain("correct");
    key("n");
    expect(await screen.findByText(second.question_text)).toBeInTheDocument();
    expect(played()).toContain("wrong");
    key("p");
    expect(await screen.findByText(question.question_text)).toBeInTheDocument();
  });

  it("toggles the shortcut guide with ? and mutes with M", () => {
    zone();
    key("Enter");
    key("?");
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
    key("Escape");
    expect(screen.queryByText("Keyboard shortcuts")).toBeNull();
    key("m");
    expect(window.localStorage.getItem("smartzone:sound")).toBe("off");
    key("m");
    expect(window.localStorage.getItem("smartzone:sound")).toBe("on");
  });

  it("a normal practice quiz has none of it", () => {
    render(<CoursePractice courseId="c1" moduleId="m1" questions={[question]} />);
    key("b");
    key("Enter");
    expect(sounds.play).not.toHaveBeenCalled();
    expect(screen.queryByText("Ready for the Smart Zone?")).toBeNull();
  });
});
