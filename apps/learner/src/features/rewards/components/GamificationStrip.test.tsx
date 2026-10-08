import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

const summary = vi.fn();
const me = vi.fn();
vi.mock("@mcc/ui", () => ({Icon: () => null}));
vi.mock("../hooks/useRewards", () => ({
  useGoalsSummary: () => summary(),
  useRewardsBalance: () => ({data: {total_points: 1250, total_gems: 40, total_silver: 0}}),
  useMyGamification: () => me(),
}));

import GamificationStrip from "./GamificationStrip";

beforeEach(() => {
  me.mockReturnValue({data: undefined});
});

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

  it("shows the level and the way to the next one", () => {
    summary.mockReturnValue({data: undefined});
    me.mockReturnValue({data: {xp: 175, level: {level: 2, name: "Explorer", xp_floor: 100, next_xp: 250, next_name: "Learner", progress_percent: 50}, badges: []}});
    render(<GamificationStrip />);
    expect(screen.getByText("Level 2 · Explorer")).toBeTruthy();
    expect(screen.getByText("75 XP to Learner")).toBeTruthy();
    expect(screen.getByRole("progressbar", {name: "Progress to the next level"}).getAttribute("aria-valuenow")).toBe("50");
  });

  it("shows sensible zeros before anything has loaded", () => {
    summary.mockReturnValue({data: undefined});
    render(<GamificationStrip />);
    expect(screen.getByText("0/3")).toBeTruthy();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });
});
