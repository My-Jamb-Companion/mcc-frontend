import {describe, expect, it} from "vitest";
import type {ApiGamificationConfig} from "../services/gamification.service";
import {describeGoal, fingerprint, fromApi, newPack, newStreak, toConfig, toInput, validate} from "./rulesForm";

const defaults: ApiGamificationConfig = {
  quiz: {points: 10, pass_percent: 50, daily_cap: 100},
  progress: {step_points: 5, step_daily_cap: 20, completion_points: 50},
  goals: {
    daily: {target: 3, reward_type: "points", reward_amount: 20},
    weekly: {target: 8, reward_type: "gems", reward_amount: 100},
    monthly: {target: 500, reward_type: "gems", reward_amount: 250},
  },
  streaks: [
    {days: 7, reward_type: "gems", reward_amount: 50, title: "7 Day Streak!"},
    {days: 30, reward_type: "silver", reward_amount: 500, title: ""},
  ],
  weekly_prize: {gems: 25, min_percentile: 60},
  referral: {reward_gems: 50},
  gem_packs: {packs: [10, 50, 100, 250], custom_max: 5000},
  actions: {
    lesson_points: 3, lesson_daily_cap: 30, module_quiz_points: 10, module_quiz_daily_cap: 50,
    attendance_points: 20, attendance_min_percent: 60, study_day_points: 5, study_day_min_cards: 5,
    daily_login_points: 2, onboarding_points: 20, survey_points: 20,
  },
  levels: [{xp: 0, name: "Beginner"}, {xp: 100, name: "Explorer"}, {xp: 250, name: "Learner"}],
  badges: [
    {key: "first_quiz_passed", name: "First Steps", description: "Pass your first quiz", target: 1, enabled: true},
    {key: "level_5", name: "Level 5", description: "", target: 5, enabled: false},
  ],
};

describe("rules form", () => {
  it("round-trips the server's configuration unchanged", () => {
    expect(toConfig(fromApi(defaults))).toEqual(defaults);
  });

  it("is valid as served", () => {
    expect(validate(fromApi(defaults))).toEqual({});
  });

  it("explains typos next to the field", () => {
    const form = fromApi(defaults);
    form.quizPoints = "ten";
    form.quizPass = "0";
    form.goals.daily.target = "0";
    form.prizePercentile = "100";
    form.referralGems = "-5";
    const errors = validate(form);
    expect(errors.quizPoints).toMatch(/whole number/);
    expect(errors.quizPass).toMatch(/between 1 and 100/);
    expect(errors["goals.daily.target"]).toMatch(/between 1/);
    expect(errors.prizePercentile).toMatch(/1 to 99/);
    expect(errors.referralGems).toMatch(/whole number/);
  });

  it("keeps the daily cap at least one award's worth", () => {
    const form = fromApi(defaults);
    form.quizPoints = "50";
    form.quizCap = "10";
    expect(validate(form).quizCap).toMatch(/at least the points/);
  });

  it("rejects duplicate streak days and pack sizes", () => {
    const form = fromApi(defaults);
    form.streaks[1].days = "7";
    form.packs[1].gems = "10";
    const errors = validate(form);
    expect(errors["streaks.1.days"]).toMatch(/already uses/);
    expect(errors["packs.1"]).toMatch(/different size/);
  });

  it("won't let a pack exceed the custom purchase limit, and needs at least one pack", () => {
    const form = fromApi(defaults);
    form.customMax = "100";
    expect(validate(form)["packs.3"]).toMatch(/larger than the custom/);
    form.packs = [];
    expect(validate(form).packs).toMatch(/at least one/);
  });

  it("new rows start empty and are invalid until filled", () => {
    const form = fromApi(defaults);
    form.streaks.push(newStreak());
    form.packs.push(newPack());
    const errors = validate(form);
    expect(errors["streaks.2.days"]).toBeTruthy();
    expect(errors["packs.4"]).toBeTruthy();
  });

  it("sends the reason trimmed and the version it was based on", () => {
    const input = toInput(fromApi(defaults), 4, "  more generous  ");
    expect(input.change_reason).toBe("more generous");
    expect(input.based_on_version).toBe(4);
    expect(toInput(fromApi(defaults), null, "first").based_on_version).toBeNull();
  });

  it("ignores row order and keys when checking for changes", () => {
    const a = fromApi(defaults);
    const b = fromApi(defaults);
    b.streaks.reverse();
    b.packs.reverse();
    expect(fingerprint(a)).toBe(fingerprint(b));
    b.referralGems = "51";
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });

  it("checks the new action points against their limits", () => {
    const form = fromApi(defaults);
    form.actions.attendance_min_percent = "0";
    form.actions.lesson_points = "-2";
    form.actions.study_day_min_cards = "x";
    const errors = validate(form);
    expect(errors["actions.attendance_min_percent"]).toMatch(/between 1 and 100/);
    expect(errors["actions.lesson_points"]).toMatch(/whole number/);
    expect(errors["actions.study_day_min_cards"]).toMatch(/whole number/);
  });

  it("needs levels that start at 0 and keep rising", () => {
    const form = fromApi(defaults);
    form.levels[0].xp = "5";
    expect(validate(form)["levels.0.xp"]).toMatch(/start at 0/);
    form.levels[0].xp = "0";
    form.levels[2].xp = "100";
    expect(validate(form)["levels.2.xp"]).toMatch(/more XP than the one before/);
    form.levels[2].xp = "250";
    form.levels[1].name = "  ";
    expect(validate(form)["levels.1.name"]).toMatch(/name/);
    form.levels.pop();
    form.levels.pop();
    expect(validate(form).levels).toMatch(/at least two/);
  });

  it("needs a name and a target for every badge, and keeps the off switch", () => {
    const form = fromApi(defaults);
    form.badges[0].name = "";
    form.badges[1].target = "0";
    const errors = validate(form);
    expect(errors["badges.0.name"]).toMatch(/name/);
    expect(errors["badges.1.target"]).toMatch(/between 1/);
    expect(toConfig(fromApi(defaults)).badges[1].enabled).toBe(false);
  });

  it("describes each goal in words", () => {
    expect(describeGoal("daily", "5")).toBe("Complete 5 practice sessions in a day");
    expect(describeGoal("weekly", "")).toBe("Pass … practice tests in a week");
    expect(describeGoal("monthly", "500")).toBe("Earn 500 points in a month");
  });
});
