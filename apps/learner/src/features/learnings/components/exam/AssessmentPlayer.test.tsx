import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import type {ApiAssessmentSession, ApiCheckResult, ApiExamSubmissionResult} from "@/src/features/exams/services/exam.service";
import AssessmentPlayer from "./AssessmentPlayer";

const sounds = vi.hoisted(() => ({play: vi.fn(), unlock: vi.fn(), buzz: vi.fn()}));
vi.mock("@mcc/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mcc/ui")>()),
  confettiCelebrate: vi.fn(),
}));
vi.mock("@/src/features/smart-zone/sound/engine", () => ({
  playSound: sounds.play, unlockAudio: sounds.unlock, buzz: sounds.buzz,
}));

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
  Object.values(sounds).forEach((f) => f.mockReset());
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

describe("AssessmentPlayer: Smart Zone", () => {
  it("opens with an intro saying how many questions and how long", () => {
    render(<AssessmentPlayer session={session("exercise", {passing_score: 60})} {...props} />);
    expect(screen.getByText("Ready for the Smart Zone?")).toBeInTheDocument();
    expect(screen.getByText(/2 questions/)).toBeInTheDocument();
    expect(screen.getByText(/2 - 4 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/Pass mark: 60%/)).toBeInTheDocument();
    expect(screen.queryByText("2 + 2?")).toBeNull();
    fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
    expect(screen.getByText("2 + 2?")).toBeInTheDocument();
  });

  it("is labelled Smart Zone and shows the session's title", () => {
    render(<AssessmentPlayer session={session("exercise")} {...props} />);
    fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
    expect(screen.getByText("Smart Zone")).toBeInTheDocument();
    expect(screen.getByText("Algebra basics")).toBeInTheDocument();
  });

  it("shows a pass or fail on the summary when the Smart Zone has a pass mark", async () => {
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

const played = () => sounds.play.mock.calls.map((c) => c[0]);
const key = (k: string, init: KeyboardEventInit = {}) => fireEvent.keyDown(window, {key: k, ...init});
const startZone = (extra: Partial<ApiAssessmentSession> = {}) => {
  render(<AssessmentPlayer session={session("exercise", extra)} {...props} />);
  fireEvent.click(screen.getByRole("button", {name: "Let's go"}));
};

describe("AssessmentPlayer: Smart Zone sounds, keys and clock", () => {
  it("wakes the audio when the learner starts", () => {
    startZone();
    expect(sounds.unlock).toHaveBeenCalled();
  });

  it("starts from the intro with Enter", () => {
    render(<AssessmentPlayer session={session("exercise")} {...props} />);
    key("Enter");
    expect(screen.getByText("2 + 2?")).toBeInTheDocument();
    expect(sounds.unlock).toHaveBeenCalled();
  });

  it("picks an option with its letter or number, with a sound", () => {
    startZone();
    key("b");
    expect(screen.getByRole("button", {name: /4/})).toHaveAttribute("aria-pressed", "true");
    key("3");
    expect(screen.getByRole("button", {name: /5/})).toHaveAttribute("aria-pressed", "true");
    expect(played().filter((n) => n === "select")).toHaveLength(2);
    key("d"); // there is no fourth option
    expect(played().filter((n) => n === "select")).toHaveLength(2);
  });

  it("checks with Enter, chimes for a right answer and goes on with Enter", async () => {
    calls.check.mockImplementation((_v, o) => o.onSuccess(check({is_correct: true, first_try: true, correct_answer: "4"})));
    startZone();
    key("b");
    key("Enter");
    expect(calls.check).toHaveBeenCalledWith({sessionId: "s1", questionId: "q1", answer: "4"}, expect.anything());
    expect(played()).toEqual(expect.arrayContaining(["enter", "correct"]));
    expect(sounds.buzz).toHaveBeenCalled();
    key("Enter");
    expect(await screen.findByText("3 + 3?")).toBeInTheDocument();
    expect(played()).toContain("next");
  });

  it("buzzes for a wrong answer and resets the streak", () => {
    calls.check.mockImplementation((_v, o) => o.onSuccess(check({})));
    startZone();
    key("a");
    key("Enter");
    expect(played()).toContain("wrong");
    expect(played()).not.toContain("correct");
  });

  it("builds a streak of answers right first time, and a wrong one ends it", async () => {
    calls.check.mockImplementation((_v, o) => o.onSuccess(check({is_correct: true, first_try: true, correct_answer: "x"})));
    startZone();
    key("a"); key("Enter"); key("Enter"); // q1 right, on to q2
    key("a"); key("Enter");
    expect(await screen.findByText("2 in a row")).toBeInTheDocument();
  });

  it("does not take letters while the learner is typing elsewhere, or keys with Ctrl held", () => {
    startZone();
    key("a", {ctrlKey: true});
    expect(screen.getByRole("button", {name: /3/})).toHaveAttribute("aria-pressed", "false");
  });

  it("asks for a hint with H and skips with S", () => {
    calls.hint.mockImplementation((_v, o) => o.onSuccess({steps: ["Try adding."], total: 2}));
    calls.reveal.mockImplementation((_v, o) => o.onSuccess({correct_answer: "4", explanation: null}));
    startZone();
    key("h");
    expect(calls.hint).toHaveBeenCalled();
    key("s");
    expect(calls.reveal).toHaveBeenCalled();
  });

  it("opens the shortcut guide with ? and closes it with Esc", () => {
    startZone();
    key("?");
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
    key("a"); // nothing happens behind the guide
    expect(screen.getByRole("button", {name: /3/})).toHaveAttribute("aria-pressed", "false");
    key("Escape");
    expect(screen.queryByText("Keyboard shortcuts")).toBeNull();
  });

  it("plays the finish sound by score, and explains when the clock ended it", async () => {
    calls.reveal.mockImplementation((_v, o) => o.onSuccess({correct_answer: "4", explanation: null}));
    calls.submit.mockImplementation((_v, o) => o.onSuccess({...graded, score_percent: 80}));
    startZone({question_count: 1, questions: session("exercise").questions.slice(0, 1)});
    key("s");
    key("Enter");
    expect(await screen.findByText(/Excellent work/)).toBeInTheDocument();
    expect(played()).toContain("complete");
  });

  it("uses the gentle sound for a low score", async () => {
    calls.reveal.mockImplementation((_v, o) => o.onSuccess({correct_answer: "4", explanation: null}));
    calls.submit.mockImplementation((_v, o) => o.onSuccess({...graded, score_percent: 20}));
    startZone({question_count: 1, questions: session("exercise").questions.slice(0, 1)});
    key("s");
    key("Enter");
    await screen.findByText(/Keep on practising/);
    expect(played()).toContain("consolation");
  });

  it("shows a countdown when the Smart Zone is timed, and submits when it reaches zero", async () => {
    vi.useFakeTimers();
    try {
      calls.submit.mockImplementation((_v, o) => o.onSuccess({...graded, score_percent: 50}));
      startZone({time_limit_minutes: 1});
      expect(screen.getByRole("timer")).toHaveTextContent("1:00");
      await vi.advanceTimersByTimeAsync(61_000);
      expect(calls.submit).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Time.s up/)).toBeInTheDocument();
      expect(played()).not.toContain("complete");
    } finally {
      vi.useRealTimers();
    }
  });

  it("leaves Practice without the Smart Zone's keys, sounds and clock", () => {
    render(<AssessmentPlayer session={session("practice")} {...props} />);
    key("a");
    expect(screen.getByRole("button", {name: /3/})).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", {name: /3/}));
    expect(sounds.play).not.toHaveBeenCalled();
  });
});
