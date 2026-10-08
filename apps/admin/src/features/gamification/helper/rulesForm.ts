import type {
  ApiActionRules,
  ApiGamificationConfig,
  GamificationConfigInput,
  GoalPeriod,
  RewardType,
} from "../services/gamification.service";

/**
 * Form state for the gamification rules screen. Everything is held as the string the admin typed;
 * toInput() converts once, at the end. The limits mirror the server's (config_schema.py), which
 * still has the last word: they are here so a typo is explained next to the field, not after a save.
 */

export interface GoalForm {
  target: string;
  rewardType: RewardType;
  rewardAmount: string;
}

export interface StreakForm {
  key: string;
  days: string;
  rewardType: RewardType;
  rewardAmount: string;
  title: string;
}

export interface PackForm {
  key: string;
  gems: string;
}

export interface LevelForm {
  key: string;
  xp: string;
  name: string;
}

export interface BadgeForm {
  key: string;
  name: string;
  description: string;
  target: string;
  enabled: boolean;
}

/** The point and limit fields for the activities beyond quizzes, as typed. */
export type ActionsForm = Record<keyof ApiActionRules, string>;

export interface RulesForm {
  quizPoints: string;
  quizPass: string;
  quizCap: string;
  stepPoints: string;
  stepCap: string;
  completionPoints: string;
  goals: Record<GoalPeriod, GoalForm>;
  streaks: StreakForm[];
  prizeGems: string;
  prizePercentile: string;
  referralGems: string;
  packs: PackForm[];
  customMax: string;
  actions: ActionsForm;
  levels: LevelForm[];
  badges: BadgeForm[];
}

export const MAX_LEVELS = 20;

/** Each action field: its label, hint and limits, in the order the page shows them. */
export const ACTION_FIELDS: {key: keyof ApiActionRules; label: string; hint?: string; min: number; max: number; suffix?: string}[] = [
  {key: "lesson_points", label: "Points per lesson finished", min: 0, max: 1000},
  {key: "lesson_daily_cap", label: "Most lesson points per day", min: 0, max: 100000},
  {key: "module_quiz_points", label: "Points for passing a module quiz", hint: "The first pass of each quiz set", min: 0, max: 1000},
  {key: "module_quiz_daily_cap", label: "Most module-quiz points per day", min: 0, max: 100000},
  {key: "attendance_points", label: "Points for attending a live class", min: 0, max: 1000},
  {key: "attendance_min_percent", label: "Share of the class to be in the call", hint: "Counted from the Zoom call log", min: 1, max: 100, suffix: "%"},
  {key: "study_day_points", label: "Points for a flashcard study day", min: 0, max: 1000},
  {key: "study_day_min_cards", label: "Different cards to review that day", min: 1, max: 1000},
  {key: "daily_login_points", label: "Points for the first visit of a day", min: 0, max: 1000},
  {key: "onboarding_points", label: "Points for finishing the welcome questions", min: 0, max: 10000},
  {key: "survey_points", label: "Points for the progress survey", min: 0, max: 10000},
];

export const newLevel = (): LevelForm => ({key: nextKey("level"), xp: "", name: ""});

export const GOAL_PERIODS: GoalPeriod[] = ["daily", "weekly", "monthly"];
export const MAX_STREAKS = 10;
export const MAX_PACKS = 8;

let counter = 0;
const nextKey = (prefix: string) => `${prefix}-${Date.now()}-${counter++}`;

export const newStreak = (): StreakForm => ({key: nextKey("streak"), days: "", rewardType: "gems", rewardAmount: "", title: ""});
export const newPack = (): PackForm => ({key: nextKey("pack"), gems: ""});

const str = (n: number) => String(n);

export function fromApi(c: ApiGamificationConfig): RulesForm {
  const goal = (g: ApiGamificationConfig["goals"][GoalPeriod]): GoalForm => ({
    target: str(g.target), rewardType: g.reward_type, rewardAmount: str(g.reward_amount),
  });
  return {
    quizPoints: str(c.quiz.points),
    quizPass: str(c.quiz.pass_percent),
    quizCap: str(c.quiz.daily_cap),
    stepPoints: str(c.progress.step_points),
    stepCap: str(c.progress.step_daily_cap),
    completionPoints: str(c.progress.completion_points),
    goals: {daily: goal(c.goals.daily), weekly: goal(c.goals.weekly), monthly: goal(c.goals.monthly)},
    streaks: c.streaks.map((m) => ({
      key: nextKey("streak"), days: str(m.days), rewardType: m.reward_type, rewardAmount: str(m.reward_amount), title: m.title,
    })),
    prizeGems: str(c.weekly_prize.gems),
    prizePercentile: str(c.weekly_prize.min_percentile),
    referralGems: str(c.referral.reward_gems),
    packs: c.gem_packs.packs.map((g) => ({key: nextKey("pack"), gems: str(g)})),
    customMax: str(c.gem_packs.custom_max),
    actions: Object.fromEntries(ACTION_FIELDS.map((f) => [f.key, str(c.actions[f.key])])) as ActionsForm,
    levels: c.levels.map((l) => ({key: nextKey("level"), xp: str(l.xp), name: l.name})),
    badges: c.badges.map((b) => ({key: b.key, name: b.name, description: b.description, target: str(b.target), enabled: b.enabled})),
  };
}

const whole = (value: string): number | null => (/^\d+$/.test(value.trim()) ? Number(value.trim()) : null);

/** The first problem with a whole number in [min, max], or undefined. */
function checkInt(value: string, min: number, max: number, what: string): string | undefined {
  const n = whole(value);
  if (n === null) return `${what} must be a whole number.`;
  if (n < min || n > max) return `${what} must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`;
  return undefined;
}

export type RulesErrors = Record<string, string>;

export function validate(form: RulesForm): RulesErrors {
  const errors: RulesErrors = {};
  const put = (key: string, message: string | undefined) => {
    if (message) errors[key] = message;
  };

  put("quizPoints", checkInt(form.quizPoints, 0, 1000, "Points"));
  put("quizPass", checkInt(form.quizPass, 1, 100, "Pass mark"));
  put("quizCap", checkInt(form.quizCap, 0, 100000, "Daily cap"));
  put("stepPoints", checkInt(form.stepPoints, 0, 1000, "Points"));
  put("stepCap", checkInt(form.stepCap, 0, 100000, "Daily cap"));
  put("completionPoints", checkInt(form.completionPoints, 0, 100000, "Bonus"));
  if (!errors.quizPoints && !errors.quizCap && Number(form.quizPoints) > Number(form.quizCap)) {
    errors.quizCap = "The daily cap must be at least the points for one quiz.";
  }
  if (!errors.stepPoints && !errors.stepCap && Number(form.stepPoints) > Number(form.stepCap)) {
    errors.stepCap = "The daily cap must be at least the points for one step.";
  }

  for (const period of GOAL_PERIODS) {
    put(`goals.${period}.target`, checkInt(form.goals[period].target, 1, 100000, "Target"));
    put(`goals.${period}.rewardAmount`, checkInt(form.goals[period].rewardAmount, 0, 100000, "Reward"));
  }

  const days = new Set<number>();
  form.streaks.forEach((m, i) => {
    put(`streaks.${i}.days`, checkInt(m.days, 2, 3650, "Days"));
    put(`streaks.${i}.rewardAmount`, checkInt(m.rewardAmount, 1, 100000, "Reward"));
    if (m.title.length > 60) errors[`streaks.${i}.title`] = "Keep the title under 60 characters.";
    const n = whole(m.days);
    if (n !== null && !errors[`streaks.${i}.days`]) {
      if (days.has(n)) errors[`streaks.${i}.days`] = "Another milestone already uses this many days.";
      days.add(n);
    }
  });
  if (form.streaks.length > MAX_STREAKS) errors.streaks = `At most ${MAX_STREAKS} streak milestones.`;

  put("prizeGems", checkInt(form.prizeGems, 0, 10000, "Prize"));
  const pct = Number(form.prizePercentile);
  if (form.prizePercentile.trim() === "" || !Number.isFinite(pct) || pct < 1 || pct > 99) {
    errors.prizePercentile = "Enter a percentage from 1 to 99.";
  }
  put("referralGems", checkInt(form.referralGems, 0, 10000, "Reward"));

  put("customMax", checkInt(form.customMax, 1, 100000, "Limit"));
  const sizes = new Set<number>();
  form.packs.forEach((p, i) => {
    put(`packs.${i}`, checkInt(p.gems, 1, 100000, "Pack size"));
    const n = whole(p.gems);
    if (n !== null && !errors[`packs.${i}`]) {
      if (n > Number(form.customMax || 0) && !errors.customMax) errors[`packs.${i}`] = "A pack can't be larger than the custom purchase limit.";
      else if (sizes.has(n)) errors[`packs.${i}`] = "Every pack must be a different size.";
      sizes.add(n);
    }
  });
  if (form.packs.length === 0) errors.packs = "Keep at least one gem pack.";
  if (form.packs.length > MAX_PACKS) errors.packs = `At most ${MAX_PACKS} gem packs.`;

  for (const field of ACTION_FIELDS) {
    put(`actions.${field.key}`, checkInt(form.actions[field.key], field.min, field.max, field.label));
  }

  form.levels.forEach((level, i) => {
    put(`levels.${i}.xp`, checkInt(level.xp, 0, 10_000_000, "XP"));
    if (!level.name.trim()) errors[`levels.${i}.name`] = "Give the level a name.";
    else if (level.name.length > 30) errors[`levels.${i}.name`] = "Keep the name under 30 characters.";
  });
  if (form.levels.length < 2) errors.levels = "Keep at least two levels.";
  else if (form.levels.length > MAX_LEVELS) errors.levels = `At most ${MAX_LEVELS} levels.`;
  else {
    const xps = form.levels.map((l) => whole(l.xp));
    if (xps[0] !== null && xps[0] !== 0) errors["levels.0.xp"] = "The first level must start at 0 XP.";
    xps.forEach((xp, i) => {
      const before = xps[i - 1];
      if (i > 0 && xp !== null && before !== null && before !== undefined && !errors[`levels.${i}.xp`] && xp <= before) {
        errors[`levels.${i}.xp`] = "Each level needs more XP than the one before.";
      }
    });
  }

  form.badges.forEach((badge, i) => {
    if (!badge.name.trim()) errors[`badges.${i}.name`] = "Give the badge a name.";
    else if (badge.name.length > 40) errors[`badges.${i}.name`] = "Keep the name under 40 characters.";
    if (badge.description.length > 140) errors[`badges.${i}.description`] = "Keep the description under 140 characters.";
    put(`badges.${i}.target`, checkInt(badge.target, 1, 100000, "Target"));
  });

  return errors;
}

export function toConfig(form: RulesForm): ApiGamificationConfig {
  const n = (v: string) => Number(v.trim());
  const goal = (g: GoalForm) => ({target: n(g.target), reward_type: g.rewardType, reward_amount: n(g.rewardAmount)});
  return {
    quiz: {points: n(form.quizPoints), pass_percent: n(form.quizPass), daily_cap: n(form.quizCap)},
    progress: {step_points: n(form.stepPoints), step_daily_cap: n(form.stepCap), completion_points: n(form.completionPoints)},
    goals: {daily: goal(form.goals.daily), weekly: goal(form.goals.weekly), monthly: goal(form.goals.monthly)},
    streaks: form.streaks.map((m) => ({
      days: n(m.days), reward_type: m.rewardType, reward_amount: n(m.rewardAmount), title: m.title.trim(),
    })),
    weekly_prize: {gems: n(form.prizeGems), min_percentile: n(form.prizePercentile)},
    referral: {reward_gems: n(form.referralGems)},
    gem_packs: {packs: form.packs.map((p) => n(p.gems)), custom_max: n(form.customMax)},
    actions: Object.fromEntries(ACTION_FIELDS.map((f) => [f.key, n(form.actions[f.key])])) as unknown as ApiActionRules,
    levels: form.levels.map((l) => ({xp: n(l.xp), name: l.name.trim()})),
    badges: form.badges.map((b) => ({key: b.key, name: b.name.trim(), description: b.description.trim(), target: n(b.target), enabled: b.enabled})),
  };
}

export function toInput(form: RulesForm, basedOn: number | null, reason: string): GamificationConfigInput {
  return {config: toConfig(form), change_reason: reason.trim(), based_on_version: basedOn};
}

/** A stable description of the form's values, to tell whether anything differs from the active version.
 * Streak and pack order doesn't matter (the server sorts them) and neither do the row keys. */
export function fingerprint(form: RulesForm): string {
  const c = toConfig(form);
  return JSON.stringify({
    ...c,
    streaks: [...c.streaks].sort((a, b) => a.days - b.days),
    gem_packs: {...c.gem_packs, packs: [...c.gem_packs.packs].sort((a, b) => a - b)},
    levels: [...c.levels].sort((a, b) => a.xp - b.xp),
  });
}

/** The sentence a student-facing rule boils down to, for the live "what this means" panel. */
export function describeGoal(period: GoalPeriod, target: string): string {
  const t = target.trim() || "…";
  return {
    daily: `Complete ${t} practice sessions in a day`,
    weekly: `Pass ${t} practice tests in a week`,
    monthly: `Earn ${t} points in a month`,
  }[period];
}
