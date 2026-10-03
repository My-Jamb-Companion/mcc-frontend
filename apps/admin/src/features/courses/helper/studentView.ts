import type {
  CreatPracticeQuestionType,
  LessonModuleContent,
  PracticeModuleContent,
  Question,
  QuizModuleContent,
  Topic,
} from "../types/types";
import {youTubeEmbedUrl} from "./video";

/**
 * What a student actually gets from a course, built from the authoring form
 * the way `serializeModulesPayload` (course.mapper.ts) saves it -- so the
 * "View as a student" preview can only show what is persisted:
 *
 *  - topics are flattened away: students see a flat list of modules;
 *  - a module's lessons stay, in order;
 *  - quiz and practice questions are merged into ONE "Practice quiz" per
 *    module (quiz first, then practice -- the save order);
 *  - "exercise" items are not saved at all, so students never see them.
 *
 * Keep the lesson-kind rules in line with the learner app's
 * `features/learnings/helper/content.mapper.ts::lessonKind`.
 */
export type StudentLessonKind = "video" | "youtube" | "pdf" | "html";

export interface StudentLesson {
  id: string;
  title: string;
  /** Media URL (video, YouTube link or PDF). Null for an HTML lesson. */
  url: string | null;
  durationSeconds: number;
  thumbnailUrl: string | null;
  /** Authored lesson HTML; mutually exclusive with `url`. */
  html: string | null;
  kind: StudentLessonKind;
}

export interface StudentModule {
  id: string;
  title: string;
  lessons: StudentLesson[];
  /** Merged quiz + practice questions: the module's "Practice quiz". */
  questions: CreatPracticeQuestionType[];
}

export function studentLessonKind(lesson: {
  content?: string | null;
  format?: string | null;
  url?: string | null;
}): StudentLessonKind {
  if (lesson.content) return "html";
  const format = lesson.format?.toUpperCase();
  if (format === "YOUTUBE" || youTubeEmbedUrl(lesson.url)) return "youtube";
  if (format === "PDF") return "pdf";
  return "video";
}

function toStudentLesson(lesson: LessonModuleContent): StudentLesson {
  const url = lesson.src || lesson.previewUrl || null;
  const html = lesson.content || null;
  return {
    id: lesson.id,
    title: lesson.title || "Untitled lesson",
    url: html ? null : url,
    durationSeconds: lesson.duration ?? 0,
    thumbnailUrl: lesson.thumbnailUrl || null,
    html,
    kind: studentLessonKind({content: html, format: lesson.format, url}),
  };
}

export function toStudentModules(topics: Topic[] = []): StudentModule[] {
  return topics
    .flatMap((topic) => topic.modules ?? [])
    .map((module) => {
      const content = module.content ?? [];
      const quizzes = content.filter((c): c is QuizModuleContent => c.type === "quiz");
      const practices = content.filter((c): c is PracticeModuleContent => c.type === "practice");
      return {
        id: module.id,
        title: module.label || "Untitled Module",
        lessons: content
          .filter((c): c is LessonModuleContent => c.type === "lesson")
          .map(toStudentLesson),
        questions: [
          ...quizzes.flatMap((q) => q.questions),
          ...practices.flatMap((p) => p.questions),
        ],
      };
    });
}

export function allStudentLessons(modules: StudentModule[]): StudentLesson[] {
  return modules.flatMap((m) => m.lessons);
}

/** "2hr 5min" or "42min" -- the learner app's total-duration label. */
export function formatTotalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}hr ${minutes}min` : `${minutes}min`;
}

/** "3:05" -- a single lesson's length under the player. */
export function formatLessonDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function studentOverview(modules: StudentModule[]) {
  const lessons = allStudentLessons(modules);
  const totalSeconds = lessons.reduce((sum, l) => sum + l.durationSeconds, 0);
  return {
    lessonCount: lessons.length,
    totalDurationLabel: formatTotalDuration(totalSeconds),
  };
}

/** A module's questions in the shape the practice-quiz component takes. */
export function toPracticeCardQuestions(questions: CreatPracticeQuestionType[]): Question[] {
  return questions.map((q) => {
    const correct = q.options.filter((o) => o.isCorrect).map((o) => o.text);
    const multi = q.type === "multiple";
    return {
      id: q.id,
      question: q.question,
      answers: q.options.map((o) => o.text),
      correctAnswer: multi ? correct : (correct[0] ?? ""),
      explanation: q.explanation || "",
      multiSelect: multi,
    };
  });
}
