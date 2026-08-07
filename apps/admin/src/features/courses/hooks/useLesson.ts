import {useMemo} from "react";
import {
  ModuleContent,
  LessonModuleContent,
  MakeModule,
} from "../../types/types";

export function isLessonItem(item: ModuleContent): item is LessonModuleContent {
  return item.type === "lesson";
}

export function calculateModuleProgress(content: ModuleContent[]): number {
  const lessons = content.filter(isLessonItem);
  if (!lessons.length) return 0;

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0);
  if (!totalDuration) return 0;

  const watchedDuration = lessons.reduce((sum, l) => {
    const duration = l.duration ?? 0;
    const watched = l.completed
      ? duration
      : Math.min(l.currentTime ?? 0, duration);
    return sum + watched;
  }, 0);

  return Math.round((watchedDuration / totalDuration) * 100);
}

export function useModuleProgress(content: ModuleContent[]) {
  return useMemo(() => calculateModuleProgress(content), [content]);
}

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Calculate level progress
 */
export function calculateLevelProgress(modules: ModuleContent[]): number {
  const lessons = modules.flatMap((module) => module.lessons ?? []);

  return calculateModuleProgress(lessons);
}
/**
 * Level progress hook
 */
export function useLevelProgress(modules: ModuleContent[]) {
  return useMemo(() => calculateLevelProgress(modules), [modules]);
}
export function useLessonsDuration(content: ModuleContent[]) {
  return useMemo(() => {
    const totalSeconds = content
      .filter(isLessonItem)
      .reduce((acc, l) => acc + (l.duration ?? 0), 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      formatted: hours > 0 ? `${hours}hr ${minutes}min` : `${minutes}min`,
    };
  }, [content]);
}

export function useAllModuleContents(topics: {modules: MakeModule[]}[]) {
  return useMemo(() => {
    const allItems: ModuleContent[] = [];
    topics?.forEach((topic) => {
      topic.modules?.forEach((module) => {
        module.content?.forEach((item) => {
          allItems.push(item);
        });
      });
    });
    return allItems;
  }, [topics]);
}
