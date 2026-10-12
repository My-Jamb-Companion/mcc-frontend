import type { QueueItem } from "./queue.service";

type LiveFormat = QueueItem["live_format"];

/**
 * Only a 1-to-1 student gets a weekly series with a matched teacher. A purchase from before live-teaching
 * formats (null) was always 1-to-1, so it still does. Self-paced students need nothing more; group students
 * are added to a class by the admin team.
 */
export const needsWeeklySlot = (format: LiveFormat): boolean => format === null || format === "one_to_one";

export const onboardingBlurb = (format: LiveFormat, who: string): string => {
  if (needsWeeklySlot(format)) {
    return `Record the weekly day and time ${who} agreed to for their recurring 1:1 teacher session.`;
  }
  return format === "group"
    ? `${who} chose a live group class. Completing onboarding activates their access; the admin team adds them to a group class and notifies them.`
    : `${who} chose self-paced learning, so there is no weekly session to arrange. Completing onboarding activates their access.`;
};
