import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, cleanup, fireEvent, render, screen} from "@testing-library/react";
import type {ApiMockResult, ApiMockSession} from "@/src/features/exams/services/exam.service";
import MockExamPlayer from "./MockExamPlayer";

const calls = vi.hoisted(() => ({save: vi.fn(), submit: vi.fn()}));

vi.mock("@/src/features/exams/services/exam.service", () => ({saveMockState: (...a: unknown[]) => calls.save(...a)}));
vi.mock("@/src/features/exams/hooks/useExams", () => ({
  useSubmitMockExam: () => ({mutate: (v: unknown, o: unknown) => calls.submit(v, o), isPending: false}),
}));
vi.mock("@mcc/ui", async (orig) => ({
  ...(await orig<typeof import("@mcc/ui")>()),
  ConfirmModal: ({open, message, confirmText, cancelText, onConfirm, onCancel}: {
    open?: boolean; message?: React.ReactNode; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel?: () => void;
  }) => open ? (
    <div role="dialog">
      {message}
      <button onClick={onConfirm}>{confirmText}</button>
      <button onClick={onCancel}>{cancelText}</button>
    </div>
  ) : null,
}));

const session = (extra: Partial<ApiMockSession> = {}): ApiMockSession => ({
  session_id: "s1",
  paper: {paper_id: "p1", title: "Mock 1", duration_minutes: 30, passing_score: 50},
  questions: [
    {question_id: "q1", question_text: "2 + 2?", description: null, question_type: "single_choice", options: ["3", "4", "5"]},
    {question_id: "q2", question_text: "Pick the primes", description: null, question_type: "multiple_choice", options: ["2", "4", "5"]},
    {question_id: "q3", question_text: "3 + 3?", description: null, question_type: "single_choice", options: ["5", "6", "7"]},
  ],
  remaining_seconds: 1800, deadline_at: null,
  state: {answers: {}, flagged: [], spent: {}, current: 0},
  ...extra,
});

const result = {session_id: "s1", finished: true, score_percent: 33} as unknown as ApiMockResult;

beforeEach(() => {
  vi.useFakeTimers();
  calls.save.mockReset().mockResolvedValue({saved: true, remaining_seconds: 1700});
  calls.submit.mockReset().mockImplementation((_v, o) => o.onSuccess(result));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

describe("MockExamPlayer", () => {
  it("shows the clock, the question and a palette, and no feedback", () => {
    render(<MockExamPlayer session={session()} onFinished={vi.fn()} />);
    expect(screen.getByRole("timer")).toHaveTextContent("30:00");
    expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
    expect(screen.getAllByRole("button", {name: /^Question \d, /})).toHaveLength(3);
    expect(screen.queryByText(/right answer/i)).toBeNull();
  });

  it("picks an answer, saves it after a pause, and sends only what changed", async () => {
    render(<MockExamPlayer session={session()} onFinished={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", {name: /^B\s*4$/}));
    expect(calls.save).not.toHaveBeenCalled();
    await advance(1300);
    expect(calls.save).toHaveBeenCalledTimes(1);
    expect(calls.save.mock.calls[0][0]).toBe("s1");
    expect(calls.save.mock.calls[0][1]).toEqual({answers: {q1: "4"}});
    await advance(3000);
    expect(calls.save).toHaveBeenCalledTimes(1);
  });

  it("moves with Next and the palette, keeping the answers", async () => {
    render(<MockExamPlayer session={session()} onFinished={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", {name: /^B\s*4$/}));
    fireEvent.click(screen.getByRole("button", {name: "Next"}));
    expect(screen.getByText("Question 2 of 3")).toBeInTheDocument();
    expect(screen.getByText("Choose all that apply.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", {name: /Question 1, answered/})[0]);
    expect(screen.getByRole("button", {name: /^B\s*4$/})).toHaveAttribute("aria-pressed", "true");
  });

  it("flags a question and shows it in the palette", () => {
    render(<MockExamPlayer session={session()} onFinished={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", {name: "Next"}));
    fireEvent.click(screen.getByRole("button", {name: "Flag for review"}));
    expect(screen.getByRole("button", {name: "Flagged"})).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", {name: "Next"}));
    expect(screen.getAllByRole("button", {name: /Question 2, flagged/}).length).toBeGreaterThan(0);
  });

  it("counts down from the server's seconds and goes red in the last five minutes", async () => {
    render(<MockExamPlayer session={session({remaining_seconds: 301})} onFinished={vi.fn()} />);
    expect(screen.getByRole("timer")).toHaveTextContent("5:01");
    expect(screen.getByRole("timer").className).not.toMatch(/red/);
    await advance(2000);
    expect(screen.getByRole("timer")).toHaveTextContent("4:59");
    expect(screen.getByRole("timer").className).toMatch(/red/);
  });

  it("asks before submitting and says what is left undone", () => {
    render(<MockExamPlayer session={session()} onFinished={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", {name: /^B\s*4$/}));
    fireEvent.click(screen.getByRole("button", {name: "Submit exam"}));
    expect(screen.getByRole("dialog")).toHaveTextContent("2 questions are unanswered and will be marked wrong");
    expect(calls.submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "Keep going"}));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("submits what was not yet saved and hands over the result", async () => {
    const onFinished = vi.fn();
    render(<MockExamPlayer session={session()} onFinished={onFinished} />);
    fireEvent.click(screen.getByRole("button", {name: /^B\s*4$/}));
    fireEvent.click(screen.getByRole("button", {name: "Submit exam"}));
    fireEvent.click(screen.getByRole("button", {name: "Submit"}));
    expect(calls.submit).toHaveBeenCalledTimes(1);
    expect(calls.submit.mock.calls[0][0]).toEqual({sessionId: "s1", update: {answers: {q1: "4"}}});
    expect(onFinished).toHaveBeenCalledWith(result);
  });

  it("submits by itself when the time is up", async () => {
    const onFinished = vi.fn();
    render(<MockExamPlayer session={session({remaining_seconds: 2})} onFinished={onFinished} />);
    expect(calls.submit).not.toHaveBeenCalled();
    await advance(2500);
    expect(calls.submit).toHaveBeenCalledTimes(1);
    expect(onFinished).toHaveBeenCalledWith(result);
  });

  it("resumes with the saved answers, flags and place", () => {
    render(<MockExamPlayer session={session({state: {answers: {q3: "6"}, flagged: ["q1"], spent: {}, current: 2}})} onFinished={vi.fn()} />);
    expect(screen.getByText("Question 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /^B\s*6$/})).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps going when a save fails and says so", async () => {
    calls.save.mockRejectedValue(new Error("offline"));
    render(<MockExamPlayer session={session()} onFinished={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", {name: /^B\s*4$/}));
    await advance(1300);
    expect(screen.getByRole("status")).toHaveTextContent(/Couldn.t save just now/);
    calls.save.mockResolvedValue({saved: true, remaining_seconds: 1});
    fireEvent.click(screen.getByRole("button", {name: /^C\s*5$/}));
    await advance(1300);
    expect(screen.queryByText(/Couldn.t save just now/)).toBeNull();
  });
});
