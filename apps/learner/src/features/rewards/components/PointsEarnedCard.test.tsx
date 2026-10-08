import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

const confetti = vi.fn();
vi.mock("@mcc/ui", () => ({Icon: () => null, confettiCelebrate: (el: unknown) => confetti(el)}));

import PointsEarnedCard from "./PointsEarnedCard";
import type {ApiGamificationUpdate} from "../services/rewards.service";

const base: ApiGamificationUpdate = {
  points_earned: 10, daily_cap_reached: false, pending_rewards: 0,
  daily_goal: {earned: 1, target: 3, status: "in_progress", just_achieved: false},
  streak: {current_streak: 2, extended: false},
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PointsEarnedCard", () => {
  it("shows the points, the day's goal and the streak", () => {
    render(<PointsEarnedCard gamification={base} scorePercent={100} />);
    expect(screen.getByText("+10 points")).toBeTruthy();
    expect(screen.getByText("1/3 practice")).toBeTruthy();
    expect(screen.getByRole("progressbar", {name: "Today's goal"}).getAttribute("aria-valuenow")).toBe("1");
    expect(screen.getByText("2-day streak")).toBeTruthy();
    expect(confetti).not.toHaveBeenCalled();
  });

  it("celebrates the moment the daily goal is reached, and says the streak grew", () => {
    render(<PointsEarnedCard gamification={{...base, daily_goal: {earned: 3, target: 3, status: "achieved", just_achieved: true}, streak: {current_streak: 3, extended: true}}} scorePercent={100} />);
    expect(screen.getByText(/Daily goal achieved!/)).toBeTruthy();
    expect(screen.getByText(/3-day streak — extended today!/)).toBeTruthy();
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it("points a student with rewards waiting to the Rewards page", () => {
    render(<PointsEarnedCard gamification={{...base, pending_rewards: 2}} scorePercent={100} />);
    const link = screen.getByRole("link", {name: /2 rewards waiting to claim/});
    expect(link.getAttribute("href")).toBe("/rewards");
  });

  it("explains why a low score earned nothing", () => {
    render(<PointsEarnedCard gamification={{...base, points_earned: 0}} scorePercent={20} />);
    expect(screen.getByText("Score 50% or more to earn points.")).toBeTruthy();
  });

  it("copes with a server that sends no goal or streak", () => {
    render(<PointsEarnedCard gamification={{...base, daily_goal: null, streak: null}} scorePercent={100} />);
    expect(screen.getByText("+10 points")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
