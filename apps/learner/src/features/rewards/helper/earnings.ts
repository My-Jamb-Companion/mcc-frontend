import type {ApiGamificationUpdate, ApiProgressUpdate} from "../services/rewards.service";

/** One line saying what a quiz or test earned, or why it earned nothing. */
export function pointsHeadline(g: ApiGamificationUpdate, scorePercent: number): {text: string; earned: boolean} {
  if (g.points_earned > 0) return {text: `+${g.points_earned} points`, earned: true};
  if (scorePercent < 50) return {text: "Score 50% or more to earn points.", earned: false};
  if (g.daily_cap_reached) return {text: "You've reached today's points limit. Come back tomorrow for more.", earned: false};
  return {text: "No new points: you've already earned them for these questions today.", earned: false};
}

/** A short message for a lesson or course progress update, or null when it earned nothing worth saying. */
export function progressMessage(update: ApiProgressUpdate | undefined): string | null {
  if (!update) return null;
  const extras = milestoneMessages(update.gamification);
  const lead = update.certificate_issued
    ? `Course complete! Certificate earned${update.points_earned > 0 ? ` and +${update.points_earned} points` : ""}.`
    : update.gamification?.daily_goal?.just_achieved
      ? "Daily goal achieved!"
      : update.points_earned > 0
        ? `+${update.points_earned} points`
        : null;
  const parts = [lead, ...extras].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

/** "Level 3: Learner!" and "Badge earned: First Steps" for a level-up or new badges, in the order they happened. */
export function milestoneMessages(g: ApiGamificationUpdate | undefined): string[] {
  if (!g) return [];
  const out: string[] = [];
  if (g.level_up && g.level) out.push(`Level ${g.level.level}: ${g.level.name}!`);
  for (const badge of g.new_badges ?? []) out.push(`Badge earned: ${badge.name}.`);
  return out;
}

/** Whether to throw confetti: a course finished, the day's goal just reached, a new level or a new badge. */
export function shouldCelebrate(g: ApiGamificationUpdate | undefined, certificateIssued = false): boolean {
  return certificateIssued || !!g?.daily_goal?.just_achieved || !!g?.level_up || !!g?.new_badges?.length;
}
