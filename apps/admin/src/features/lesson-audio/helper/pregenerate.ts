import type {AudioStatus, LessonAudio} from "../services/lessonAudio.service";

/** One piece of audio to make. */
export interface AudioTask {
  lectureId: string;
  title: string;
  section: number;
  part: number;
  chars: number;
}

export type LessonState = "ready" | "partial" | "none";

/** Whether a lesson has all, some or none of its audio made. */
export function lessonState(lesson: LessonAudio): LessonState {
  if (lesson.ready_parts >= lesson.parts) return "ready";
  return lesson.ready_parts > 0 ? "partial" : "none";
}

/** The words for a lesson's state, for the list. */
export function stateLabel(lesson: LessonAudio): string {
  const state = lessonState(lesson);
  if (state === "ready") return "Ready";
  if (state === "none") return "Not made";
  return `${lesson.ready_parts} of ${lesson.parts} ready`;
}

/** The lessons that still need audio: the only ones worth selecting. */
export const needsAudio = (lesson: LessonAudio): boolean => lesson.missing.length > 0;

/** Every missing part of the chosen lessons, in lesson order, ready to be made one by one. */
export function buildTasks(status: AudioStatus, selected: Set<string>): AudioTask[] {
  return status.lectures
    .filter((l) => selected.has(l.lecture_id))
    .flatMap((l) => l.missing.map((m) => ({lectureId: l.lecture_id, title: l.title, section: m.section, part: m.part, chars: m.chars})));
}

export const totalChars = (tasks: AudioTask[]): number => tasks.reduce((sum, t) => sum + t.chars, 0);

/** Characters of new speech still allowed today. */
export const remainingToday = (status: Pick<AudioStatus, "daily_limit" | "spent_today">): number =>
  Math.max(0, status.daily_limit - status.spent_today);

/** True when making all of these would go past today's allowance, so the run will stop part-way. */
export const exceedsAllowance = (status: Pick<AudioStatus, "daily_limit" | "spent_today">, tasks: AudioTask[]): boolean =>
  totalChars(tasks) > remainingToday(status);

/** "12,400" */
export const formatChars = (n: number): string => n.toLocaleString("en-US");

/** Percent done of a run, 0 to 100. */
export const percentDone = (done: number, total: number): number => (total <= 0 ? 0 : Math.min(100, Math.round((done / total) * 100)));

/** A new selection with a lesson toggled. */
export function toggled(selected: Set<string>, id: string): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** Everything that still needs audio, or nothing if it is all already chosen (the "select all" toggle). */
export function allNeeding(status: AudioStatus, selected: Set<string>): Set<string> {
  const needing = status.lectures.filter(needsAudio).map((l) => l.lecture_id);
  return needing.length > 0 && needing.every((id) => selected.has(id)) ? new Set() : new Set(needing);
}
