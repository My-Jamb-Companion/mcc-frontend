import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

const summary = vi.fn();
const monthly = vi.fn();

vi.mock("@mcc/ui", () => ({Icon: () => null}));
vi.mock("./hooks/useRewards", () => ({
  useGoalsSummary: () => summary(),
  useMonthlyGoal: () => monthly(),
  useWeeklyMilestones: () => ({data: {milestones: []}}),
  useRewardsStats: () => ({data: {rewards: []}}),
}));

import GoalsProgress from "./Goals";

const goal = (status: string) => ({
  data: {
    daily: {date: "2026-10-08", target: 3, earned: 3, metric: "practice_count", description: "d", completion_percent: 100, status},
    weekly: {week_start: "", week_end: "", target: 8, earned: 2, metric: "practice_test_count", description: "Pass 8 practice tests this week", completion_percent: 25, status: "in_progress"},
    streak: {current_streak: 4, longest_streak: 9},
  },
  isLoading: false,
  isError: false,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Goals & Progress", () => {
  it("congratulates the student when the backend says the daily goal is achieved", () => {
    summary.mockReturnValue(goal("achieved"));
    monthly.mockReturnValue({data: undefined, isError: false});
    render(<GoalsProgress />);
    expect(screen.getByText(/Daily Goal Achieved/)).toBeTruthy();
  });

  it("does not congratulate while the goal is still in progress", () => {
    summary.mockReturnValue(goal("in_progress"));
    monthly.mockReturnValue({data: undefined, isError: false});
    render(<GoalsProgress />);
    expect(screen.queryByText(/Daily Goal Achieved/)).toBeNull();
  });

  it("shows how far through the weekly goal the student is", () => {
    summary.mockReturnValue(goal("in_progress"));
    monthly.mockReturnValue({data: undefined, isError: false});
    render(<GoalsProgress />);
    expect(screen.getByText("2/8 this week")).toBeTruthy();
    expect(screen.getByRole("progressbar", {name: "Weekly goal"}).getAttribute("aria-valuenow")).toBe("2");
    expect(screen.getByText("4 days")).toBeTruthy();
  });

  it("says so when the goals can't be loaded, instead of showing zeros", () => {
    summary.mockReturnValue({data: undefined, isLoading: false, isError: true});
    monthly.mockReturnValue({data: undefined, isError: true});
    render(<GoalsProgress />);
    expect(screen.getByText("Couldn't load your goals.")).toBeTruthy();
    expect(screen.getByText("Couldn't load your monthly goal.")).toBeTruthy();
    expect(screen.getByText("/— points")).toBeTruthy();
  });

  it("shows the monthly goal's real target", () => {
    summary.mockReturnValue(goal("in_progress"));
    monthly.mockReturnValue({data: {month: "October 2026", earned: 120, target: 500, description: "Earn 500 points this month"}, isError: false});
    render(<GoalsProgress />);
    expect(screen.getByText("/500 points")).toBeTruthy();
    expect(screen.getByText("24%")).toBeTruthy();
  });
});
