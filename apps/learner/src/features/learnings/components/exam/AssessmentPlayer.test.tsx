import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import type {ApiAssessmentSession, ApiCheckResult, ApiExamSubmissionResult} from "@/src/features/exams/services/exam.service";
import AssessmentPlayer from "./AssessmentPlayer";

const calls = vi.hoisted(() => ({
  check: vi.fn(),
  hint: vi.fn(),
  reveal: vi.fn(),
  submit: vi.fn(),
}));

vi.mock("@/src/features/exams/hooks/useExams", () => {
  const hook = (fn: (vars: unknown, opts: {onSuccess?: (r: unknown) => void; onError?: (e: unknown) => void}) => void) => () => ({
    mutate: fn, isPending: false,
  });
  return {
    useCheckAnswer: hook((v, o) => calls.check(v, o)),
    useAssessmentHint: hook((v, o) => calls.hint(v, o)),
    useRevealAnswer: hook((v, o) => calls.reveal(v, o)),
    useSubmitAssessment: hook((v, o) => calls.submit(v, o)),
  };
});
vi.mock("@/src/features/brainy/hooks/useAiFeedback", () => ({
  useAnalysis: () => ({mutate: vi.fn(), isPending: false}),
  useQuestionHelp: () => ({mutate: vi.fn(), isPending: false}),
}));
vi.mock("@/src/features/rewards/components/PointsEarnedCard", () => ({default: () => <div>points card</div>}));

const session = (mode: "practice" | "exercise", extra: Partial<ApiAssessmentSession> = {}): ApiAssessmentSession => ({
  session_id: "s1", mode, title: "Algebra basics", node_type: "module", node_id: "m1", question_count: 2,
  time_limit_minutes: null, passing_score: null, estimated_minutes: {min: 2, max: 4},
  questions: [
    {question_id: "q1", question_text: "2 + 2?", question_type: "single_choice", options: ["3", "4", "5"]},
    {question_id: "q2", question_text: "3 + 3?", question_type: "single_choice", options: ["5", "6", "7"]},
  ],
  ...extra,
});

const check = (over: Partial<ApiCheckResult>): ApiCheckResult => ({
  is_correct: false, attempt_no: 1, first_try: false, hints_used: 0, correct_answer: null, explanation: null,
  option_feedback: null, already_solved: false, ...over,
});

const graded: ApiExamSubmissionResult = {
  score_percent: 50, passed: null,
  results: [
    {question_id: "q1", your_answer: "4", correct_answer: "4", is_correct: true, explanation: "Because.", feedback: null, option_feedback: null},
    {question_id: "q2", your_answer: null, correct_answer: "6", is_correct: false, explanation: null, feedback: null, revealed: true},
  ],
  topic_breakdown: [{node_type: "module", node_id: "m1", title: "Algebra basics", correct: 1, total: 2, percent: 50, stars: 2.5}],
  recommended_lessons: [{module_id: "m1", module_title: "Algebra basics", lecture_id: "l1", lecture_title: "Variables"}],
  readiness: {readiness_percent: 43, readiness_before: 20, leveled_up: [{node_id: "m1", title: "Algebra basics", from: "not_started", to: "familiar"}]},
};

const props = {onDone: vi.fn(), onRestart: vi.fn(), onOpenLecture: vi.fn()};

beforeEach(() => {
  Object.values(calls).forEach((f) => f.mockReset());
  Object.values(props).forEach((f) => f.mockReset());
});
afterEach(cleanup);

describe("AssessmentPlayer: Practice", () => {
  it("checks an answer on the server, and a miss leaves the question open", async () => {
    calls.check.mockImplementation((_v, o) => o.onSuccess(check({})));
    render(<AssessmentPlayer session={session("practice")} {...props} />);
    expect(screen.getByRole("button", {name: "Check"})).toBeDisabled();
    fireEvent.click(screen.getByRole("button", {name: /3/}));
    fireEvent.click(screen.getByRole("button", {name: "Check"}));
    expect(calls.check).toHaveBeenCalledWith({sessionId: "s1", questionId: "q1", answer: "3"}, expect.anything());
    expect(await screen.findByText(/Not quite/)).toBeInTheDocument();
    expect(screen.queryByText("That's right!")).toBeNull();
    // the same option can't be checked again; a different one can
    expect(screen.getByRole("button", {name: "Check again"})).toBeDisabled();
    fireEvent.click(screen.getByRole("button", {name: /5/}));
    expect(screen.getByRole("button", {name: "Check again"})).toBeEnabled();
  });

  it("shows the author's response to the option picked", async () => {
    calls.check.mockImplementation((_v, o) => o.onSuccess(check({option_feedback: "A common slip: that is 2 + 3."})));
    render(<AssessmentPlayer session={session("practice")} {...props} />);
    fireEvent.click(screen.getByRole("button", {name: /5/}));
    fireEvent.click(screen.getByRole("button", {name: "Check"}));
    expect(await screen.findByText("A common slip: that is 2 + 3.")).toBeInTheDocument();
  });

  it("a right answer shows the explanation and moves on", async () => {
    calls.check.mockImplementation((_v, o) => o.onSuccess(check({is_correct: true, first_try: true, correct_answer: "4", explanation: "Two and two."})));
    render(<AssessmentPlayer session={session("practice")} {...props} />);
    fireEvent.click(screen.getByRole("button", {name: /4/}));
    fireEvent.click(screen.getByRole("button", {name: "Check"}));
    expect(await screen.findByText("That's right!")).toBeInTheDocument();
    expect(screen.getByText("Two and two.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Next question"}));
    expect(screen.getByText("3 + 3?")).toBeInTheDocument();
    expect(screen.getByText("2 of 2")).toBeInTheDocument();
  });

  it("hints come a step at a time and run out", async () => {
    const steps = ["Think.", "Rule out 3.", "It is 4."];
    let n = 0;
    calls.hint.mockImplementation((_v, o) => {
      n += 1;
      o.onSuccess({step: n, total: 3, text: steps[n - 1], last: n === 3, steps: steps.slice(0, n)});
    });
    render(<AssessmentPlayer session={session("practice")} {...props} />);
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", {name: /Hint/}));
    expect(screen.getByText("It is 4.")).toBeInTheDocument();
    expect(screen.getByRole("list", {name: "Hints"}).children).toHaveLength(3);
    expect(screen.getByRole("button", {name: "Hint 3/3"})).toBeDisabled();
  });

  it("skipping shows the answer", async () => {
    calls.reveal.mockImplementation((_v, o) => o.onSuccess({correct_answer: "4", explanation: "Two and two."}));
    render(<AssessmentPlayer session={session("practice")} {...props} />);
    fireEvent.click(screen.getByRole("button", {name: "Skip"}));
    expect(await screen.findByText("The answer is 4")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Next question"})).toBeInTheDocument();
  });

  it("finishing shows the summary: right first time, topic stars and a lesson to revisit", async () => {
    calls.check.mockImplementation((_v, o) => o.onSuccess(check({is_correct: true, first_try: true, correct_answer: "4"})));
    calls.reveal.mockImplementation((_v, o) => o.onSuccess({correct_answer: "6", explanation: null}));
    calls.submit.mockImplementation((_v, o) => o.onSuccess(graded));
    render(<AssessmentPlayer session={session("practice")} {...props} />);
    fireEvent.click(screen.getByRole("button", {name: /4/}));
    fireEvent.click(screen.getByRole("button", {name: "Check"}));
    fireEvent.click(await screen.findByRole("button", {name: "Next question"}));
    fireEvent.click(screen.getByRole("button", {name: "Skip"}));
    fireEvent.click(await screen.findByRole("button", {name: "Show summary"}));
    await waitFor(() => expect(calls.submit).toHaveBeenCalledWith("s1", expect.anything()));
    expect(await screen.findByText("right first time")).toBeInTheDocument();
    expect(screen.getByText("Leveled up on 1 topic")).toBeInTheDocument();
    expect(screen.getByText("(up 23 points)")).toBeInTheDocument();
    expect(screen.getByRole("img", {name: "2.5 out of 5 stars"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: /Variables/}));
    expect(props.onOpenLecture).toHaveBeenCalledWith("l1");
    fireEvent.click(screen.getByRole("button", {name: "Try again"}));
    expect(props.onRestart).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Done"}));
    expect(props.onDone).toHaveBeenCalled();
  });
});

describe("AssessmentPlayer: Exercise", () => {
  it("opens with an intro saying how many questions and how long", () => {
    render(<AssessmentPlayer session={session("exercise", {passing_score: 60})} {...props} />);
    expect(screen.getByText("Time for an exercise?")).toBeInTheDocument();
    expect(screen.getByText(/2 questions/)).toBeInTheDocument();
    expect(screen.getByText(/2 - 4 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/Pass mark: 60%/)).toBeInTheDocument();
    expect(screen.queryByText("2 + 2?")).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
    expect(screen.getByText("2 + 2?")).toBeInTheDocument();
  });

  it("is labelled Exercise and shows the session's title", () => {
    render(<AssessmentPlayer session={session("exercise")} {...props} />);
    fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
    expect(screen.getByText("Exercise")).toBeInTheDocument();
    expect(screen.getByText("Algebra basics")).toBeInTheDocument();
  });

  it("shows a pass or fail on the summary when the Exercise has a pass mark", async () => {
    calls.reveal.mockImplementation((_v, o) => o.onSuccess({correct_answer: "4", explanation: null}));
    calls.submit.mockImplementation((_v, o) => o.onSuccess({...graded, score_percent: 40, passed: false, passing_score: 60}));
    render(<AssessmentPlayer session={session("exercise", {question_count: 1, questions: session("exercise").questions.slice(0, 1)})} {...props} />);
    fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
    fireEvent.click(screen.getByRole("button", {name: "Skip"}));
    fireEvent.click(await screen.findByRole("button", {name: "Show summary"}));
    expect(await screen.findByText(/Not passed/)).toBeInTheDocument();
    expect(screen.getByText(/pass mark 60%/)).toBeInTheDocument();
  });
});
