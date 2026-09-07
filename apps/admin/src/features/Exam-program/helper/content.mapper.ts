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
}

export interface ApiLecturePayload {
  title: string;
  video_url?: string;
  file_size_bytes?: number;
}

export interface ApiModulePayload {
  title: string;
  lectures: ApiLecturePayload[];
  quizzes: ApiQuestionPayload[];
  practices: ApiQuestionPayload[];
}

export interface ApiSubTopicPayload {
  title: string;
  description?: string;
  test_exercises: ApiQuestionPayload[];
  modules: ApiModulePayload[];
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

function toApiQuestion(q: CreatPracticeQuestionType): ApiQuestionPayload {
  return {
    question_text: q.question,
    question_type: toApiQuestionType(q.type),
    options: q.options.map((opt) => opt.text),
    correct_answers: q.options.filter((opt) => opt.isCorrect).map((opt) => opt.text),
    explanation: q.explanation || undefined,
  };
}

function toApiLecture(file: FileRow): ApiLecturePayload {
  return {
    title: file.title,
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
    quizzes: quizzes.flatMap((l) => l.questions ?? []).map(toApiQuestion),
    practices: practices.flatMap((l) => l.questions ?? []).map(toApiQuestion),
  };
}

function toApiSubTopic(subTopic: SubTopic): ApiSubTopicPayload {
  return {
    title: subTopic.label || "Untitled sub-topic",
    description: subTopic.description || undefined,
    test_exercises: subTopic.hasQuiz
      ? (subTopic.quizQuestions ?? []).map(toApiQuestion)
      : [],
    modules: subTopic.modules.map(toApiModule),
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
