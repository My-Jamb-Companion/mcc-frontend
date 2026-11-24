import type {ApiDailyLimit} from "@/src/features/courses/services/course.service";

/**
 * Where a learner stands on the free-course daily limit (one module a day) in one course:
 *  none            the limit does not apply (a paid learner)
 *  choose          nothing opened yet today: any module can be opened, and that one becomes today's
 *  used-here       today's module is in this course; everything else waits for tomorrow
 *  used-elsewhere  today's module is in another free course; this one waits for tomorrow
 */
export type LimitState = "none" | "choose" | "used-here" | "used-elsewhere";

export function limitState(limit: ApiDailyLimit, moduleIds: string[]): LimitState {
  if (!limit.restricted) return "none";
  if (!limit.unlocked_module_id) return "choose";
  return moduleIds.includes(limit.unlocked_module_id) ? "used-here" : "used-elsewhere";
}

/** "5 hr 12 min", "42 min", "less than a minute" -- the wait until the limit resets. */
export function timeUntil(isoTime: string | null, nowMs: number = Date.now()): string {
  const target = isoTime ? Date.parse(isoTime) : NaN;
  if (Number.isNaN(target)) return "tomorrow";
  const minutes = Math.ceil((target - nowMs) / 60000);
  if (minutes <= 0) return "less than a minute";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}
