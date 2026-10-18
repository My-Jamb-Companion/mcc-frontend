import {useMemo} from "react";
import {Lesson, Module} from "@/src/features/learnings/helper/content.mapper";

/**
 * There's no per-lesson completion in the backend (course_progress is one
 * percent for the whole course), so "completed" is whatever the viewer has
 * marked finished this session -- see CourseContent.tsx's completedLessonIds
 * state, pushed here as a plain Set of lesson ids.
 */
export function calculateProgress(lessons: Lesson[], completedLessonIds: Set<string>): number {
  if (!lessons.length) return 0;
  const completedCount = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
  return Math.round((completedCount / lessons.length) * 100);
}

export function useModuleProgress(lessons: Lesson[], completedLessonIds: Set<string>) {
  return useMemo(
    () => calculateProgress(lessons, completedLessonIds),
    [lessons, completedLessonIds],
  );
}

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/** "1hr 5min", "12min", "37s", or "0min" when there is no video time at all. */
export function formatTotalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}hr ${minutes}min`;
  if (minutes > 0) return `${minutes}min`;
  return totalSeconds > 0 ? `${Math.floor(totalSeconds)}s` : "0min";
}

export function useLessonsDuration(lessons: Lesson[]) {
  return useMemo(() => {
    const totalSeconds = lessons.reduce((acc, lesson) => acc + (lesson.duration ?? 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      formatted: formatTotalDuration(totalSeconds),
    };
  }, [lessons]);
}

export function useAllLessons(modules: Module[]) {
  return useMemo(() => modules.flatMap((module) => module.lessons), [modules]);
}
