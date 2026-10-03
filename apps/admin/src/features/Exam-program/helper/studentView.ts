import type {Topic} from "../components/CreateProgramSteps/Step2";
import type {CreatPracticeQuestionType} from "../components/CreateProgramSteps/PracticeQuestions";
import {youTubeEmbedUrl} from "@/src/features/courses/helper/video";

/**
 * What a student actually gets from an exam program, built from the
 * authoring form the way `serializeTopicsPayload` (content.mapper.ts) saves
 * it, so the "View as a student" preview only shows what is persisted:
 * topic -> sub-topic -> module -> lectures, a module's "Quiz" and "Practice"
 * question sets, and a "Test" per sub-topic (its test exercises).
 *
 * Mirrors the learner app's ExamContentTree / ExamProgramContent, including
 * hiding a Quiz / Practice / Test row when it has no questions.
 */
export type StudentLectureKind = "video" | "youtube" | "html";

export interface StudentExamQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswers: string[];
  explanation: string | null;
}

export interface StudentExamLecture {
  id: string;
  title: string;
  url: string | null;
  html: string | null;
  kind: StudentLectureKind;
}

export interface StudentExamModule {
  id: string;
  title: string;
  lectures: StudentExamLecture[];
  quiz: StudentExamQuestion[];
  practice: StudentExamQuestion[];
}

export interface StudentExamSubTopic {
  id: string;
  title: string;
  modules: StudentExamModule[];
  test: StudentExamQuestion[];
  /** The Test's timer (minutes) and passing score (percent); null = unset. */
  testTimerMinutes: number | null;
  testPassingScore: number | null;
}

export interface StudentExamTopic {
  id: string;
  title: string;
  subTopics: StudentExamSubTopic[];
}

function toQuestion(q: CreatPracticeQuestionType): StudentExamQuestion {
  return {
    id: q.id,
    text: q.question,
    options: q.options.map((o) => o.text),
    correctAnswers: q.options.filter((o) => o.isCorrect).map((o) => o.text),
    explanation: q.explanation || null,
  };
}

export function toStudentExamTree(topics: Topic[] = []): StudentExamTopic[] {
  return topics.map((topic) => ({
    id: topic.id,
    title: topic.label || "Untitled topic",
    subTopics: (topic.subTopics ?? []).map((sub) => ({
      id: sub.id,
      title: sub.label || "Untitled sub-topic",
      test: sub.hasQuiz ? (sub.quizQuestions ?? []).map(toQuestion) : [],
      testTimerMinutes: sub.hasQuiz ? (sub.testSettings?.timer ?? null) : null,
      testPassingScore: sub.hasQuiz ? (sub.testSettings?.passingScore ?? null) : null,
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
                kind: html ? "html" : youTubeEmbedUrl(url) ? "youtube" : "video",
              };
            }),
          quiz: leaves.filter((l) => l.type === "quiz").flatMap((l) => l.questions ?? []).map(toQuestion),
          practice: leaves.filter((l) => l.type === "practice").flatMap((l) => l.questions ?? []).map(toQuestion),
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
        s.test.length > 0 ||
        s.modules.some((m) => m.lectures.length > 0 || m.quiz.length > 0 || m.practice.length > 0),
    ),
  );
}

/** "JAMB — English", the way the learner app titles a program. */
export function examProgramTitle(exam: string, subject: string): string {
  return [exam, subject].filter(Boolean).join(" — ") || "Exam prep program";
}
