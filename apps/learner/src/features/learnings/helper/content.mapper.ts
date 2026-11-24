import {ApiCourseContentRow} from "@/src/features/courses/services/course.service";
import {youTubeEmbedUrl} from "./video";

/**
 * The real per-lesson data GET /courses/<id>/content actually returns --
 * replaces the old demo `Lessons` type. There's no backend concept of
 * "completed" per lesson (course_progress only stores one percent for the
 * whole course), so it isn't part of this shape; the viewer tracks which
 * lessons were watched this session locally (see CourseContent.tsx).
 */
export interface Lesson {
  id: string;
  title: string;
  videoUrl: string | null;
  duration: number;
  thumbnailUrl: string | null;
  /** "MP4", "YOUTUBE", "PDF", etc. Null/unrecognized falls back to the plain video player. */
  format: string | null;
  /** Admin-authored lesson HTML. Mutually exclusive with videoUrl -- a
   * lesson is either media or text, never both. */
  content: string | null;
  /** True when the free-course daily limit has this lesson's module closed today: it has no video or text to show. */
  locked: boolean;
}

export interface ExerciseSet {
  name: string;
  count: number;
  /** The Smart Zone's countdown in minutes; null = untimed. */
  timerMinutes: number | null;
}

export interface QuizSet {
  name: string;
  count: number;
  /** Minutes allowed; null = untimed. */
  timerMinutes: number | null;
  /** Percent needed to pass; null = no pass/fail. */
  passingScore: number | null;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  /** The module's named exercise sets; each is its own entry, apart from the Practice quiz. */
  exerciseSets: ExerciseSet[];
  /** The module's named quizzes, each a separate (optionally timed) entry. */
  quizSets: QuizSet[];
  /** How many questions the module's Practice quiz has; undefined when the server does not say. */
  practiceCount?: number;
  /** True when the free-course daily limit has the module closed today (one module a day, until midnight in Lagos). */
  locked: boolean;
}

export type LessonKind = "video" | "youtube" | "pdf" | "html";

export function lessonKind(lesson: Lesson): LessonKind {
  if (lesson.content) return "html";
  const format = lesson.format?.toUpperCase();
  if (format === "YOUTUBE" || youTubeEmbedUrl(lesson.videoUrl)) return "youtube";
  if (format === "PDF") return "pdf";
  return "video";
}

/** Groups the flat module/lesson rows GET /courses/<id>/content returns into
 * a module -> lessons tree, preserving row order (already module then
 * lecture order_index from the backend). */
export function groupContentRows(rows: ApiCourseContentRow[]): Module[] {
  const modules: Module[] = [];
  const byId = new Map<string, Module>();

  for (const row of rows) {
    let mod = byId.get(row.module_id);
    if (!mod) {
      mod = {
        id: row.module_id,
        title: row.module_title,
        lessons: [],
        practiceCount: row.practice_count,
        locked: row.locked ?? false,
        exerciseSets: (row.exercise_sets ?? []).map((e) => ({name: e.name, count: e.count, timerMinutes: e.timer_minutes ?? null})),
        quizSets: (row.quiz_sets ?? []).map((q) => ({
          name: q.name,
          count: q.count,
          timerMinutes: q.timer_minutes ?? null,
          passingScore: q.passing_score ?? null,
        })),
      };
      byId.set(row.module_id, mod);
      modules.push(mod);
    }

    // A mod with no lectures of its own (e.g. quiz-only) still produces
    // one row from the backend's LEFT JOIN, with every lecture field null --
    // that's what creates the Module above; there's no lesson to add.
    if (!row.lesson_id) continue;

    mod.lessons.push({
      id: row.lesson_id,
      title: row.lesson_title ?? "Untitled lesson",
      videoUrl: row.video_url ?? null,
      duration: row.duration_seconds ?? 0,
      thumbnailUrl: row.thumbnail_url ?? null,
      format: row.file_format ?? null,
      content: row.content ?? null,
      locked: row.locked ?? false,
    });
  }

  return modules;
}
