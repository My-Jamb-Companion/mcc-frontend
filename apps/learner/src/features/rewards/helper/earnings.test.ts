import {describe, expect, it} from "vitest";
import {pointsHeadline, progressMessage, shouldCelebrate} from "./earnings";
import type {ApiGamificationUpdate, ApiProgressUpdate} from "../services/rewards.service";

const g = (over: Partial<ApiGamificationUpdate> = {}): ApiGamificationUpdate => ({
  points_earned: 0, daily_cap_reached: false, daily_goal: null, streak: null, pending_rewards: 0, ...over,
});

describe("pointsHeadline", () => {
  it("says what was earned", () => expect(pointsHeadline(g({points_earned: 10}), 80)).toEqual({text: "+10 points", earned: true}));
  it("tells a low score how to earn points", () => expect(pointsHeadline(g(), 30).text).toBe("Score 50% or more to earn points."));
  it("explains the daily limit", () => expect(pointsHeadline(g({daily_cap_reached: true}), 90).text).toMatch(/today's points limit/));
  it("explains a repeat of the same questions", () => expect(pointsHeadline(g(), 90).text).toMatch(/already earned them for these questions today/));
});

describe("progressMessage", () => {
  const update = (over: Partial<ApiProgressUpdate>): ApiProgressUpdate => ({
    progress_percent: 50, points_earned: 0, certificate_issued: false, gamification: g(), ...over,
  });
  it("celebrates a finished course", () =>
    expect(progressMessage(update({certificate_issued: true, points_earned: 55}))).toBe("Course complete! Certificate earned and +55 points."));
  it("celebrates the daily goal", () =>
    expect(progressMessage(update({gamification: g({daily_goal: {earned: 3, target: 3, status: "achieved", just_achieved: true}})}))).toBe("Daily goal achieved!"));
  it("reports points", () => expect(progressMessage(update({points_earned: 5}))).toBe("+5 points"));
  it("stays quiet when nothing was earned or the server sent nothing", () => {
    expect(progressMessage(update({}))).toBeNull();
    expect(progressMessage(undefined)).toBeNull();
  });
});

describe("shouldCelebrate", () => {
  it("is for a finished course or a goal reached just now", () => {
    expect(shouldCelebrate(g(), true)).toBe(true);
    expect(shouldCelebrate(g({daily_goal: {earned: 3, target: 3, status: "achieved", just_achieved: true}}))).toBe(true);
    expect(shouldCelebrate(g({daily_goal: {earned: 3, target: 3, status: "achieved", just_achieved: false}}))).toBe(false);
    expect(shouldCelebrate(undefined)).toBe(false);
  });
});
