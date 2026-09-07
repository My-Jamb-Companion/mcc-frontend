import {
  ApiExamModule,
  ApiExamProgramDetail,
  ApiExamQuestion,
  ApiExamSubTopic,
  ApiExamTopic,
} from "../services/exam.service";
import {ExamProgramFormValues} from "../components/CreateExamProgram";
import {
  MakeModule,
  SubTopic,
  Topic,
  uid,
} from "../components/CreateProgramSteps/Step2";
import {FileRow} from "../components/CreateProgramSteps/LessonsCreate";
import {
  CreatPracticeQuestionType,
} from "../components/CreateProgramSteps/PracticeQuestions";
import {fromApiLevel} from "./helper";

function toUiQuestionType(
  questionType: string,
): CreatPracticeQuestionType["type"] {
  return questionType === "multi_choice" ? "multiple" : "single";
}

function toUiQuestion(q: ApiExamQuestion): CreatPracticeQuestionType {
  const correctSet = new Set(q.correct_answers ?? []);

  return {
    id: q.question_id ?? uid(),
    type: toUiQuestionType(q.question_type),
    question: q.question_text,
    description: q.description ?? undefined,
    options: (q.options ?? []).map((text) => ({
      id: uid(),
      text,
      isCorrect: correctSet.has(text),
    })),
    explanation: q.explanation ?? undefined,
  };
}

function toUiLecture(lecture: ApiExamModule["lectures"][number]): FileRow {
  return {
    id: lecture.lecture_id ?? uid(),
    title: lecture.title,
    // Not returned by this endpoint — the player only needs the URL.
    format: "MP4",
    size: lecture.file_size_bytes
      ? `${(lecture.file_size_bytes / (1024 * 1024)).toFixed(1)}mb`
      : "0mb",
    src: lecture.video_url,
    previewUrl: lecture.video_url,
  };
}

function toUiModule(apiModule: ApiExamModule): MakeModule {
  const leaves: MakeModule["leaves"] = [
    {
      id: uid(),
      label: "Lectures",
      type: "lectures",
      count: apiModule.lectures?.length ?? 0,
      lessons: (apiModule.lectures ?? []).map(toUiLecture),
    },
    {
      id: uid(),
      label: "Practice",
      type: "practice",
      count: apiModule.practices?.length ?? 0,
      questions: (apiModule.practices ?? []).map(toUiQuestion),
    },
  ];

  // Module-level quizzes aren't created by the sidebar's default "add
  // module" flow (only a sub-topic-level quiz is), but the backend allows
  // them — surface one only when the module actually has quiz questions.
  if (apiModule.quizzes && apiModule.quizzes.length > 0) {
    leaves.push({
      id: uid(),
      label: "Quiz",
      type: "quiz",
      count: apiModule.quizzes.length,
      questions: apiModule.quizzes.map(toUiQuestion),
    });
  }

  return {
    id: apiModule.module_id ?? uid(),
    label: apiModule.title,
    leaves,
  };
}

function toUiSubTopic(apiSubTopic: ApiExamSubTopic): SubTopic {
  const hasQuiz = (apiSubTopic.test_exercises?.length ?? 0) > 0;

  return {
    id: apiSubTopic.sub_topic_id ?? uid(),
    label: apiSubTopic.title,
    description: apiSubTopic.description ?? undefined,
    modules: (apiSubTopic.modules ?? []).map(toUiModule),
    hasQuiz,
    quizQuestions: hasQuiz
      ? apiSubTopic.test_exercises.map(toUiQuestion)
      : undefined,
  };
}

function toUiTopic(apiTopic: ApiExamTopic): Topic {
  return {
    id: apiTopic.topic_id ?? uid(),
    label: apiTopic.title,
    subTopics: (apiTopic.sub_topics ?? []).map(toUiSubTopic),
  };
}

/**
 * Deserializes GET /admin/exams/programs/{program_id}'s `topics` tree back
 * into the Step2 UI's Topic[] shape, for editing an existing program.
 */
export function deserializeExamTopics(apiTopics: ApiExamTopic[]): Topic[] {
  if (!apiTopics || apiTopics.length === 0) return [];
  return apiTopics.map(toUiTopic);
}

/**
 * Adapts GET /admin/exams/programs/{program_id} into ExamProgramFormValues,
 * ready to be passed straight into methods.reset(...).
 *
 * `exam`, `subject`, and `category` stay blank here: the create flow's
 * Step1 selects match against a hardcoded value list (e.g. "jamb"), while
 * this endpoint only returns opaque backend ids (`exam_id`, `subject_id`,
 * `category_id`) with no name to map back to those values.
 */
export function fromApiExamProgramDetail(
  api: ApiExamProgramDetail,
): ExamProgramFormValues {
  return {
    id: api.program_id,
    exam: "",
    subject: "",
    category: "",
    instructor: api.teacher_id ?? "",
    price: api.price ?? "",
    level: fromApiLevel(api.level),
    description: api.description ?? "",
    learnItems: api.learning_outcomes ?? [],
    tags: api.tags ?? [],
    content: {topics: deserializeExamTopics(api.topics)},
    upload: {
      coverImage: null,
      promoVideo: null,
      coverImageUrl: api.cover_image_url ?? undefined,
      promoVideoUrl: api.promo_video_url ?? undefined,
    },
  };
}
