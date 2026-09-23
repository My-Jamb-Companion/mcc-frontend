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
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export type LessonKind = "video" | "youtube" | "pdf";

export function lessonKind(lesson: Lesson): LessonKind {
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
    let module = byId.get(row.module_id);
    if (!module) {
      module = {id: row.module_id, title: row.module_title, lessons: []};
      byId.set(row.module_id, module);
      modules.push(module);
    }

    // A module with no lectures of its own (e.g. quiz-only) still produces
    // one row from the backend's LEFT JOIN, with every lecture field null --
    // that's what creates the Module above; there's no lesson to add.
    if (!row.lesson_id) continue;

    module.lessons.push({
      id: row.lesson_id,
      title: row.lesson_title ?? "Untitled lesson",
      videoUrl: row.video_url ?? null,
      duration: row.duration_seconds ?? 0,
      thumbnailUrl: row.thumbnail_url ?? null,
      format: row.file_format ?? null,
    });
  }

  return modules;
}
