import {useMemo} from "react";
import {
  Lessons,
  CourseModule,
  CourseDetail,
} from "@/src/features/constants/demoCourses";

/**
 * Only count lessons that contribute to course progress.
 * Practice/exam lessons are excluded.
 */
const isTrackableLesson = (lesson: Lessons) => {
  return lesson.type === "video" || lesson.type === "doc";
};

/**
 * Calculate progress percentage of a module.
 *
 * Video/doc lessons:
 * - completed => full duration
 * - incomplete => currentTime progress
 *
 * Practice/exam:
 * - ignored
 */
export function calculateModuleProgress(lessons: Lessons[]): number {
  const trackableLessons = lessons.filter(isTrackableLesson);

  if (!trackableLessons.length) return 0;

  const totalDuration = trackableLessons.reduce(
    (sum, lesson) => sum + (lesson.duration ?? 0),
    0,
  );

  if (!totalDuration) return 0;

  const watchedDuration = trackableLessons.reduce((sum, lesson) => {
    const duration = lesson.duration ?? 0;

    const watched = lesson.completed
      ? duration
      : Math.min(lesson.currentTime ?? 0, duration);

    return sum + watched;
  }, 0);

  return Math.round((watchedDuration / totalDuration) * 100);
}

/**
 * Calculate level progress
 */
export function calculateLevelProgress(modules: CourseModule[]): number {
  const lessons = modules.flatMap((module) => module.lessons ?? []);

  return calculateModuleProgress(lessons);
}

/**
 * Module progress hook
 */
export function useModuleProgress(lessons: Lessons[]) {
  return useMemo(() => calculateModuleProgress(lessons), [lessons]);
}

/**
 * Level progress hook
 */
export function useLevelProgress(modules: CourseModule[]) {
  return useMemo(() => calculateLevelProgress(modules), [modules]);
}

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);

  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Total lesson duration
 *
 * Ignores:
 * - practice
 * - exams
 */
export function useLessonsDuration(lessons: Lessons[]) {
  return useMemo(() => {
    const totalSeconds = lessons
      .filter(isTrackableLesson)
      .reduce((acc, lesson) => acc + (lesson.duration ?? 0), 0);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    return {
      hours,

      minutes,

      seconds,

      formatted: hours > 0 ? `${hours}hr ${minutes}min` : `${minutes}min`,
    };
  }, [lessons]);
}

/**
 * Flatten every lesson in course
 */
export function useAllLessons(course: CourseDetail) {
  return useMemo(() => {
    const allLessons: Lessons[] = [];

    course.curriculums.forEach((level) => {
      level.modules.forEach((module) => {
        module.lessons?.forEach((lesson) => {
          allLessons.push(lesson);
        });
      });
    });

    return allLessons;
  }, [course]);
}
