import type {Topic} from "../components/CreateProgramSteps/Step2";
import type {CreatPracticeQuestionType} from "../components/CreateProgramSteps/PracticeQuestions";
import {isPdfUrl, youTubeEmbedUrl} from "@/src/features/courses/helper/video";
import {hasResponses, optionResponses} from "@/src/features/question-editor/types";
import {displayName, setsOf} from "./practiceSets";

/**
 * What a student actually gets from an exam program, built from the
 * authoring form the way `serializeTopicsPayload` (content.mapper.ts) saves
 * it, so the "View as a student" preview only shows what is persisted:
 * topic -> sub-topic -> module -> lectures, a module's "Practice" and
 * "Exercise" question sets, and a unit "Exercise" per sub-topic.
 *
 * Mirrors the learner app's ExamContentTree / ExamProgramContent, including
 * hiding a Practice / Exercise row when it has no questions.
 */
export type StudentLectureKind = "video" | "youtube" | "pdf" | "html";

export interface StudentExamQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswers: string[];
  explanation: string | null;
  /** Practice and Exercise: the teacher's response for each option, aligned to `options`. */
  optionFeedback?: (string | null)[];
}

export interface StudentExamLecture {
  id: string;
  title: string;
  url: string | null;
  html: string | null;
  kind: StudentLectureKind;
}

export interface StudentPracticeSet {
  id: string;
  /** What the set is called: its name, or "Practice" for the default set. */
  name: string;
  questions: StudentExamQuestion[];
}

export interface StudentExamModule {
  id: string;
  title: string;
  lectures: StudentExamLecture[];
  exercise: StudentExamQuestion[];
  practice: StudentExamQuestion[];
  /** The Practice's named sets (empty ones left out). One set is the Practice itself; several are listed to pick from. */
  practiceSets: StudentPracticeSet[];
  /** The module Exercise's timer (minutes) and passing score (percent); null = unset. */
  exerciseTimerMinutes: number | null;
  exercisePassingScore: number | null;
}

export interface StudentExamSubTopic {
  id: string;
  title: string;
  modules: StudentExamModule[];
  /** The sub-topic's own (unit) Exercise. */
  unitExercise: StudentExamQuestion[];
  /** The unit Exercise's timer (minutes) and passing score (percent); null = unset. */
  unitTimerMinutes: number | null;
  unitPassingScore: number | null;
}

export interface StudentExamTopic {
  id: string;
  title: string;
  subTopics: StudentExamSubTopic[];
}

function toQuestion(q: CreatPracticeQuestionType, practice = false): StudentExamQuestion {
  return {
    id: q.id,
    text: q.question,
    options: q.options.map((o) => o.text),
    correctAnswers: q.options.filter((o) => o.isCorrect).map((o) => o.text),
    explanation: q.explanation || null,
    ...(practice && hasResponses(q) ? {optionFeedback: optionResponses(q)} : {}),
  };
}

export function toStudentExamTree(topics: Topic[] = []): StudentExamTopic[] {
  return topics.map((topic) => ({
    id: topic.id,
    title: topic.label || "Untitled topic",
    subTopics: (topic.subTopics ?? []).map((sub) => ({
      id: sub.id,
      title: sub.label || "Untitled sub-topic",
      unitExercise: sub.hasQuiz ? (sub.quizQuestions ?? []).map((q) => toQuestion(q, true)) : [],
      unitTimerMinutes: sub.hasQuiz ? (sub.testSettings?.timer ?? null) : null,
      unitPassingScore: sub.hasQuiz ? (sub.testSettings?.passingScore ?? null) : null,
      modules: (sub.modules ?? []).map((module) => {
        const leaves = module.leaves ?? [];
        return {
          id: module.id,
          title: module.label || "Untitled Module",
          lectures: leaves
            .filter((l) => l.type === "lectures")
            .flatMap((l) => l.lessons ?? [])
            .map((file): StudentExamLecture => {
              const html = file.content || null;
              const url = html ? null : file.src || file.previewUrl || null;
              return {
                id: file.id,
                title: file.title || "Untitled lecture",
                url,
                html,
                kind: html ? "html" : youTubeEmbedUrl(url) ? "youtube" : isPdfUrl(url) ? "pdf" : "video",
              };
            }),
          exercise: leaves.filter((l) => l.type === "exercise").flatMap((l) => l.questions ?? []).map((q) => toQuestion(q, true)),
          exerciseTimerMinutes: module.quizSettings?.timer ?? null,
          exercisePassingScore: module.quizSettings?.passingScore ?? null,
          practice: leaves.filter((l) => l.type === "practice").flatMap((l) => setsOf(l).flatMap((set) => set.questions)).map((q) => toQuestion(q, true)),
          practiceSets: leaves
            .filter((l) => l.type === "practice")
            .flatMap((l) => setsOf(l))
            .filter((set) => set.questions.length > 0)
            .map((set) => ({id: set.id, name: displayName(set.name), questions: set.questions.map((q) => toQuestion(q, true))})),
        };
      }),
    })),
  }));
}

export function allExamLectures(tree: StudentExamTopic[]): StudentExamLecture[] {
  return tree.flatMap((t) => t.subTopics.flatMap((s) => s.modules.flatMap((m) => m.lectures)));
}

/** The preview is worth opening once there is a lecture or any question to look at. */
export function hasPreviewableExamContent(topics: Topic[] = []): boolean {
  return toStudentExamTree(topics).some((t) =>
    t.subTopics.some(
      (s) =>
        s.unitExercise.length > 0 ||
        s.modules.some((m) => m.lectures.length > 0 || m.exercise.length > 0 || m.practice.length > 0),
    ),
  );
}

/** "JAMB — English", the way the learner app titles a program. */
export function examProgramTitle(exam: string, subject: string): string {
  return [exam, subject].filter(Boolean).join(" — ") || "Exam prep program";
}
