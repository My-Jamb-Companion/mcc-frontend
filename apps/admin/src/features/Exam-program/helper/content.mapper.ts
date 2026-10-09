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
  /** The lecture's id, sent back on save so the same lecture is kept (students' progress and
   * bookmarks follow it); the editor's own id for a lecture it just created is accepted too. */
  lecture_id?: string;
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

/**
 * The lecture's stored URL. A `blob:` link only exists in the browser that
 * picked the file (the upload hadn't finished, or failed), so it is never saved.
 */
function lectureUrl(file: FileRow): string | undefined {
  return [file.src, file.previewUrl].find((u) => u && !u.startsWith("blob:")) || undefined;
}

/** A lecture whose file is still uploading, or failed to: it has a local link only, and nothing else to save. */
function isUnfinishedUpload(file: FileRow): boolean {
  const hasLocalLink = [file.src, file.previewUrl].some((u) => u?.startsWith("blob:"));
  return hasLocalLink && !file.content && !lectureUrl(file);
}

/** How many lectures a save has to leave out because their upload isn't finished. */
export function unfinishedLectureCount(topics: Topic[] | undefined): number {
  return (topics ?? [])
    .flatMap((t) => t.subTopics)
    .flatMap((st) => st.modules)
    .flatMap((m) => m.leaves)
    .filter((leaf) => leaf.type === "lectures")
    .flatMap((leaf) => leaf.lessons ?? [])
    .filter(isUnfinishedUpload).length;
}

/** The sentence shown when a save left unfinished uploads out. */
export function unfinishedUploadsNotice(count: number): string {
  return `${count} ${count === 1 ? "lecture is" : "lectures are"} still uploading (or the upload failed), so ${
    count === 1 ? "it was" : "they were"
  } not saved. Save again once ${count === 1 ? "it has" : "they have"} finished.`;
}

function toApiLecture(file: FileRow): ApiLecturePayload {
  return {
    lecture_id: file.id,
    title: file.title,
    content: file.content || undefined,
    video_url: lectureUrl(file),
    file_size_bytes: file.fileSizeBytes ?? file.file?.size ?? undefined,
  };
}

function toApiModule(module: MakeModule): ApiModulePayload {
  const lectures = module.leaves.filter((l) => l.type === "lectures");
  const practices = module.leaves.filter((l) => l.type === "practice");
  const quizzes = module.leaves.filter((l) => l.type === "quiz");

  return {
    title: module.label || "Untitled Module",
    // A lecture whose upload hasn't finished (or failed) has nothing to save yet.
    lectures: lectures
      .flatMap((l) => l.lessons ?? [])
      .filter((file) => file.content || lectureUrl(file))
      .map(toApiLecture),
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
