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
  if (update.certificate_issued) {
    return `Course complete! Certificate earned${update.points_earned > 0 ? ` and +${update.points_earned} points` : ""}.`;
  }
  if (update.gamification?.daily_goal?.just_achieved) return "Daily goal achieved!";
  if (update.points_earned > 0) return `+${update.points_earned} points`;
  return null;
}

/** Whether to throw confetti: a course finished, or the day's goal just reached. */
export function shouldCelebrate(g: ApiGamificationUpdate | undefined, certificateIssued = false): boolean {
  return certificateIssued || !!g?.daily_goal?.just_achieved;
}
