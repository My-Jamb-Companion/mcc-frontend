import {afterEach, describe, expect, it, vi} from "vitest";
import {cleanup, render, screen} from "@testing-library/react";

const confetti = vi.fn();
vi.mock("@mcc/ui", () => ({Icon: () => null, confettiCelebrate: (el: unknown) => confetti(el)}));

import PointsEarnedCard from "./PointsEarnedCard";
import {milestoneMessages, progressMessage, shouldCelebrate} from "../helper/earnings";
import type {ApiGamificationUpdate} from "../services/rewards.service";

const level = {level: 3, name: "Learner", xp_floor: 250, next_xp: 500, next_name: "Achiever", progress_percent: 10};
const badge = {key: "first_quiz_passed", name: "First Steps", description: "", target: 1, progress: 1, earned: true, earned_at: null};
const base: ApiGamificationUpdate = {
  points_earned: 10, daily_cap_reached: false, pending_rewards: 0, daily_goal: null, streak: null,
  xp: 260, level, level_up: true, new_badges: [badge],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("level-ups and badges", () => {
  it("announces a level-up and each new badge, with confetti", () => {
    render(<PointsEarnedCard gamification={base} scorePercent={100} />);
    expect(screen.getByText(/Level up! You're now Level 3: Learner/)).toBeTruthy();
    expect(screen.getByText("Badge earned: First Steps")).toBeTruthy();
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it("says nothing extra when nothing happened, and copes with an older server", () => {
    render(<PointsEarnedCard gamification={{points_earned: 10, daily_cap_reached: false, pending_rewards: 0, daily_goal: null, streak: null}} scorePercent={100} />);
    expect(screen.queryByText(/Level up/)).toBeNull();
    expect(confetti).not.toHaveBeenCalled();
  });

  it("writes the same milestones for a toast", () => {
    expect(milestoneMessages(base)).toEqual(["Level 3: Learner!", "Badge earned: First Steps."]);
    expect(milestoneMessages(undefined)).toEqual([]);
    expect(progressMessage({progress_percent: 50, points_earned: 3, certificate_issued: false, gamification: base}))
      .toBe("+3 points Level 3: Learner! Badge earned: First Steps.");
  });

  it("celebrates a level-up or a badge on their own", () => {
    expect(shouldCelebrate({...base, new_badges: []})).toBe(true);
    expect(shouldCelebrate({...base, level_up: false})).toBe(true);
    expect(shouldCelebrate({...base, level_up: false, new_badges: []})).toBe(false);
  });
});
