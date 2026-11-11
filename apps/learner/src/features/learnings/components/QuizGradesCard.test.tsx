import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";

vi.mock("@mcc/ui", () => ({Icon: () => null}));

import QuizGradesCard from "./QuizGradesCard";

const grade = {
  attempts: 2, best_percent: 80, last_percent: 50, last_at: "2026-11-10T10:00:00Z", passing_score: null, passed: null,
  history: [
    {score_percent: 50, taken_at: "2026-11-10T10:00:00Z", correct: 1, total: 2},
    {score_percent: 80, taken_at: "2026-11-09T10:00:00Z", correct: 4, total: 5},
  ],
};

afterEach(cleanup);

describe("QuizGradesCard", () => {
  it("shows best, latest and attempts, and each attempt's score", () => {
    render(<QuizGradesCard title="Practice quiz" grade={grade} onRetake={() => {}} />);
    expect(screen.getByRole("heading", {name: "Practice quiz"})).toBeTruthy();
    expect(screen.getByText("Best").nextSibling?.textContent).toBe("80%");
    expect(screen.getByText("Latest").nextSibling?.textContent).toBe("50%");
    expect(screen.getByText("Attempts").nextSibling?.textContent).toBe("2");
    expect(screen.getByLabelText("Attempts").querySelectorAll("li")).toHaveLength(2);
  });

  it("takes it again when asked", () => {
    const retake = vi.fn();
    render(<QuizGradesCard title="Smart Zone" grade={grade} onRetake={retake} />);
    fireEvent.click(screen.getByRole("button", {name: "Take it again"}));
    expect(retake).toHaveBeenCalledOnce();
  });
});
