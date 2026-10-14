import type { QueueItem } from "./queue.service";

type LiveFormat = QueueItem["live_format"];

/**
 * Only a paid 1-to-1 student gets a weekly series with a matched teacher. A paid purchase from before
 * live-teaching formats (null) was always 1-to-1, so it still does. Free students have no live teaching, and
 * self-paced students need nothing more; group students are added to a class by the admin team.
 * `isPaid` is undefined from an older backend, which is treated as paid.
 */
export const needsWeeklySlot = (format: LiveFormat, isPaid: boolean | undefined = true): boolean =>
  isPaid !== false && (format === null || format === "one_to_one");

/** The format as the student chose it. Older purchases were always 1-to-1; a free enrolment has none. */
export const formatLabel = (format: LiveFormat, isPaid: boolean | undefined = true): string =>
  isPaid === false
    ? "Free enrolment"
    : format === "self_paced"
      ? "Self-paced"
      : format === "group"
        ? "Live group"
        : "Live 1-to-1";

export const onboardingBlurb = (format: LiveFormat, who: string, isPaid: boolean | undefined = true): string => {
  if (isPaid === false) {
    return `${who} is on a free enrolment, and live teaching is only for paid enrolments, so there is no weekly session to arrange. Completing onboarding activates their access.`;
  }
  if (needsWeeklySlot(format, isPaid)) {
    return `Record the weekly day and time ${who} agreed to for their recurring 1:1 teacher session.`;
  }
  return format === "group"
    ? `${who} chose a live group class. Completing onboarding activates their access; the admin team adds them to a group class and notifies them.`
    : `${who} chose self-paced learning, so there is no weekly session to arrange. Completing onboarding activates their access.`;
};
