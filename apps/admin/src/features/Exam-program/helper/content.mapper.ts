import {hasResponses, optionResponses} from "@/src/features/question-editor/types";
import {CreatPracticeQuestionType} from "../components/CreateProgramSteps/PracticeQuestions";
import {FileRow} from "../components/CreateProgramSteps/LessonsCreate";
import {MakeModule, SubTopic, Topic} from "../components/CreateProgramSteps/Step2";

// ─────────────────────────────────────────────
// PATCH /admin/exams/programs/{program_id} payload shapes
// ─────────────────────────────────────────────

export type ApiQuestionType = "single_choice" | "multi_choice";

export interface ApiQuestionPayload {
  question_text: string;
  question_type: ApiQuestionType;
  options: string[];
  correct_answers: string[];
  explanation?: string;
  /** Practice only: the response for each option, aligned to `options` (null where none). */
  option_feedback?: (string | null)[];
}

export interface ApiLecturePayload {
  title: string;
  content?: string;
  video_url?: string;
  file_size_bytes?: number;
}

export interface ApiModulePayload {
  title: string;
  lectures: ApiLecturePayload[];
  quizzes: ApiQuestionPayload[];
  practices: ApiQuestionPayload[];
  /** The module Quiz's timer (minutes) and passing score (percent). */
  quiz_timer_minutes?: number;
  quiz_passing_score?: number;
}

export interface ApiSubTopicPayload {
  title: string;
  description?: string;
  test_exercises: ApiQuestionPayload[];
  modules: ApiModulePayload[];
  /** The Test's timer (minutes) and passing score (percent). */
  test_timer_minutes?: number;
  test_passing_score?: number;
}

export interface ApiTopicPayload {
  title: string;
  sub_topics: ApiSubTopicPayload[];
}

/**
 * Maps a Step1/PracticeQuestions question's UI `type` ("single" | "multiple")
 * to the backend's question_type enum.
 */
export function toApiQuestionType(type: string): ApiQuestionType {
  return type === "multiple" ? "multi_choice" : "single_choice";
}

function toApiQuestion(q: CreatPracticeQuestionType, practice = false): ApiQuestionPayload {
  return {
    question_text: q.question,
    question_type: toApiQuestionType(q.type),
    options: q.options.map((opt) => opt.text),
    correct_answers: q.options.filter((opt) => opt.isCorrect).map((opt) => opt.text),
    explanation: q.explanation || undefined,
    // Responses belong to Practice only.
    ...(practice && hasResponses(q) ? {option_feedback: optionResponses(q)} : {}),
  };
}

function toApiLecture(file: FileRow): ApiLecturePayload {
  return {
    title: file.title,
    content: file.content || undefined,
    // No dedicated media-upload flow is wired up for exam lectures yet, so
    // this falls back to the local blob preview URL — same stopgap used by
    // the courses feature's module mapper until real upload lands.
    video_url: file.src || file.previewUrl || undefined,
    file_size_bytes: file.file?.size ?? undefined,
  };
}

function toApiModule(module: MakeModule): ApiModulePayload {
  const lectures = module.leaves.filter((l) => l.type === "lectures");
  const practices = module.leaves.filter((l) => l.type === "practice");
  const quizzes = module.leaves.filter((l) => l.type === "quiz");

  return {
    title: module.label || "Untitled Module",
    lectures: lectures.flatMap((l) => l.lessons ?? []).map(toApiLecture),
    quizzes: quizzes.flatMap((l) => l.questions ?? []).map((q) => toApiQuestion(q)),
    practices: practices.flatMap((l) => l.questions ?? []).map((q) => toApiQuestion(q, true)),
    ...(module.quizSettings?.timer ? {quiz_timer_minutes: module.quizSettings.timer} : {}),
    ...(module.quizSettings?.passingScore !== undefined ? {quiz_passing_score: module.quizSettings.passingScore} : {}),
  };
}

function toApiSubTopic(subTopic: SubTopic): ApiSubTopicPayload {
  return {
    title: subTopic.label || "Untitled sub-topic",
    description: subTopic.description || undefined,
    test_exercises: subTopic.hasQuiz
      ? (subTopic.quizQuestions ?? []).map((q) => toApiQuestion(q))
      : [],
    modules: subTopic.modules.map(toApiModule),
    ...(subTopic.hasQuiz && subTopic.testSettings?.timer ? {test_timer_minutes: subTopic.testSettings.timer} : {}),
    ...(subTopic.hasQuiz && subTopic.testSettings?.passingScore !== undefined
      ? {test_passing_score: subTopic.testSettings.passingScore}
      : {}),
  };
}

/**
 * Serializes the Step2 UI Topic[] tree into the nested `topics` payload
 * expected by PATCH /admin/exams/programs/{program_id}.
 */
export function serializeTopicsPayload(topics: Topic[]): ApiTopicPayload[] {
  return topics.map((topic) => ({
    title: topic.label || "Untitled topic",
    sub_topics: topic.subTopics.map(toApiSubTopic),
  }));
}
