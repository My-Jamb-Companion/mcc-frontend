import type {Lesson, Module} from "./content.mapper";

export type AfterLesson = {kind: "lesson"; lesson: Lesson} | {kind: "quiz"; moduleId: string} | null;

/**
 * What "Continue" opens once a lesson is finished: from a module's last lesson, that module's Practice quiz (unless
 * the server says it is empty); otherwise the next lesson. Null after the course's last lesson when there is no quiz.
 */
export function afterLesson(modules: Module[], lessonId: string): AfterLesson {
  const lessons = modules.flatMap((m) => m.lessons);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) return null;
  const module = modules.find((m) => m.lessons.some((l) => l.id === lessonId));
  const isLastOfModule = module?.lessons[module.lessons.length - 1]?.id === lessonId;
  if (module && isLastOfModule && module.practiceCount !== 0) return {kind: "quiz", moduleId: module.id};
  return index < lessons.length - 1 ? {kind: "lesson", lesson: lessons[index + 1]} : null;
}
