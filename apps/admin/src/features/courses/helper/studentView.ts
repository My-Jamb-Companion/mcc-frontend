import type {
  CreatPracticeQuestionType,
  LessonModuleContent,
  PracticeModuleContent,
  Question,
  Topic,
} from "../types/types";
import {youTubeEmbedUrl} from "./video";
import {hasResponses, isMultiple, optionResponses} from "@/src/features/question-editor/types";

/**
 * What a student actually gets from a course, built from the authoring form
 * the way `serializeModulesPayload` (course.mapper.ts) saves it -- so the
 * "View as a student" preview can only show what is persisted:
 *
 *  - topics are flattened away: students see a flat list of modules;
 *  - a module's lessons stay, in order;
 *  - a module's practice questions are its ONE "Practice quiz", in the order
 *    they were arranged (the save order);
 *  - each named quiz set (with its timer and passing score) and each named
 *    exercise set is its own entry for the student, never part of the
 *    Practice quiz.
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

export interface StudentExerciseSet {
  name: string;
  questions: CreatPracticeQuestionType[];
}

export interface StudentQuizSet {
  name: string;
  questions: CreatPracticeQuestionType[];
  /** Minutes allowed; null = untimed. */
  timerMinutes: number | null;
  /** Percent needed to pass; null = no pass/fail. */
  passingScore: number | null;
}

export interface StudentModule {
  id: string;
  title: string;
  lessons: StudentLesson[];
  /** The module's practice questions: its "Practice quiz". */
  questions: CreatPracticeQuestionType[];
  /** The module's quiz sets, each a separate (optionally timed) entry; same-named sets are one. */
  quizSets: StudentQuizSet[];
  /** The module's exercise sets, each a separate entry; same-named sets are one. */
  exerciseSets: StudentExerciseSet[];
}

/** An unnamed quiz is saved (and shown) as "Quiz". */
export const DEFAULT_QUIZ_NAME = "Quiz";

/** An exercise with no name is saved (and shown) as "Exercise". */
export const DEFAULT_EXERCISE_NAME = "Exercise";

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
      const exerciseSets = new Map<string, CreatPracticeQuestionType[]>();
      for (const item of content) {
        if (item.type !== "exercise") continue;
        const name = item.name?.trim() || DEFAULT_EXERCISE_NAME;
        exerciseSets.set(name, [...(exerciseSets.get(name) ?? []), ...item.questions]);
      }
      const quizSets = new Map<string, StudentQuizSet>();
      for (const item of content) {
        if (item.type !== "quiz") continue;
        const name = item.title?.trim() || DEFAULT_QUIZ_NAME;
        const existing = quizSets.get(name);
        quizSets.set(name, {
          name,
          questions: [...(existing?.questions ?? []), ...item.questions],
          timerMinutes: item.settings?.timer || existing?.timerMinutes || null,
          passingScore: item.settings?.passingScore ?? existing?.passingScore ?? null,
        });
      }
      return {
        id: module.id,
        title: module.label || "Untitled Module",
        lessons: content
          .filter((c): c is LessonModuleContent => c.type === "lesson")
          .map(toStudentLesson),
        questions: content
          .filter((c): c is PracticeModuleContent => c.type === "practice")
          .flatMap((c) => c.questions),
        quizSets: [...quizSets.values()],
        exerciseSets: [...exerciseSets].map(([name, questions]) => ({name, questions})),
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

/**
 * A module's questions in the shape the practice-quiz component takes. Pass
 * `practice` for the Practice quiz, whose questions carry the teacher's
 * response for each option; exercises and quizzes never do.
 */
export function toPracticeCardQuestions(questions: CreatPracticeQuestionType[], practice = false): Question[] {
  return questions.map((q) => {
    const correct = q.options.filter((o) => o.isCorrect).map((o) => o.text);
    const multi = isMultiple(q.type);
    return {
      id: q.id,
      question: q.question,
      answers: q.options.map((o) => o.text),
      correctAnswer: multi ? correct : (correct[0] ?? ""),
      explanation: q.explanation || "",
      multiSelect: multi,
      ...(practice && hasResponses(q) ? {optionFeedback: optionResponses(q)} : {}),
    };
  });
}
