import {useMemo} from "react";
import {Lessons, CourseModule, courseDetails} from "@/src/features/constants/demoCourses";

/**
 * Calculate the progress percentage of a module from its lessons.
 *
 * For each lesson:
 *  - If `completed` is true → count the full `duration` as watched.
 *  - Otherwise → use `currentTime` (capped at `duration` to avoid overflow).
 *
 * @returns A percentage (0 – 100), rounded to the nearest integer.
 */
export function calculateModuleProgress(lessons: Lessons[]): number {
  if (!lessons.length) return 0;

  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);
  if (totalDuration === 0) return 0;

  const totalWatched = lessons.reduce((sum, l) => {
    const watched = l.completed
      ? l.duration
      : Math.min(l.currentTime, l.duration);
    return sum + watched;
  }, 0);

  return Math.round((totalWatched / totalDuration) * 100);
}

/**
 * Calculate the overall progress of a level by flattening all lessons
 * across every module and computing a single weighted percentage.
 */
export function calculateLevelProgress(modules: CourseModule[]): number {
  const allLessons = modules.flatMap((m) => m.lessons || []);
  return calculateModuleProgress(allLessons);
}

/**
 * React hook wrapper around `calculateModuleProgress`.
 * Memoises the result so it only recalculates when the lessons array changes.
 */
export function useModuleProgress(lessons: Lessons[]): number {
  return useMemo(() => calculateModuleProgress(lessons), [lessons]);
}

/**
 * React hook that computes the overall progress of a level
 * from all lessons across all its modules.
 */
export function useLevelProgress(modules: CourseModule[]): number {
  return useMemo(() => calculateLevelProgress(modules), [modules]);
}

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function useLessonsDuration(lessons: Lessons[]) {
  return useMemo(() => {
    const totalSeconds = lessons.reduce(
      (acc, lesson) => acc + lesson.duration,
      0,
    );

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


export function useAllLessons(course:  (typeof courseDetails)[0]){
  return useMemo(()=>{
    const allLessons:Lessons[] = []
    course.curriculums.forEach((level)=>{
      level.modules.forEach((module)=>{
        module.lessons?.forEach((lesson)=>{
          allLessons.push(lesson)
        })
      })
    })
    return allLessons
  },[course])
}