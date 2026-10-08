import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

const summary = vi.fn();
vi.mock("@mcc/ui", () => ({Icon: () => null}));
vi.mock("../hooks/useRewards", () => ({
  useGoalsSummary: () => summary(),
  useRewardsBalance: () => ({data: {total_points: 1250, total_gems: 40, total_silver: 0}}),
}));

import GamificationStrip from "./GamificationStrip";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("GamificationStrip", () => {
  it("shows streak, today's goal, points and gems, and links to Rewards", () => {
    summary.mockReturnValue({data: {daily: {earned: 2, target: 3, status: "in_progress"}, streak: {current_streak: 5}}});
    render(<GamificationStrip />);
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("2/3")).toBeTruthy();
    expect(screen.getByText("1,250")).toBeTruthy();
    expect(screen.getByText("40")).toBeTruthy();
    expect(screen.getByRole("link", {name: "Your progress and rewards"}).getAttribute("href")).toBe("/rewards");
  });

  it("shows sensible zeros before anything has loaded", () => {
    summary.mockReturnValue({data: undefined});
    render(<GamificationStrip />);
    expect(screen.getByText("0/3")).toBeTruthy();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });
});
