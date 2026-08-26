import {
  ApiLecturePayload,
  ApiModulePayload,
  ApiQuizQuestionPayload,
  CreatPracticeQuestionType,
  LessonModuleContent,
  MakeModule,
  Option,
  PracticeModuleContent,
  QuestionTypeApi,
  QuizModuleContent,
  Topic,
} from "../types/types";

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Maps question_type enum from backend to frontend or vice-versa.
 */
export function normalizeQuestionType(
  type: string,
): QuestionTypeApi {
  if (type === "single" || type === "single_choice") {
    return "single_choice";
  }
  if (type === "multiple" || type === "multi_choice") {
    return "multi_choice";
  }
  return "long_short_answer";
}

/**
 * Serializes UI Topic[] data structure into API ApiModulePayload[] format
 * suitable for PATCH /admin/courses/{course_id}
 */
export function serializeModulesPayload(topics: Topic[]): ApiModulePayload[] {
  if (!topics || topics.length === 0) return [];

  const allModules: MakeModule[] = topics.flatMap((t) => t.modules);

  return allModules.map((module) => {
    // 1. Extract lessons/lectures
    const lessons = module.content.filter(
      (c): c is LessonModuleContent => c.type === "lesson",
    );

    const lectures: ApiLecturePayload[] = lessons.map((lesson) => ({
      title: lesson.title,
      video_url: lesson.src || lesson.previewUrl || undefined,
      file_format: lesson.format || "MP4",
      file_size_bytes: lesson.fileSizeBytes ?? lesson.file?.size ?? undefined,
      duration_seconds: lesson.duration ?? undefined,
      thumbnail_url: lesson.thumbnailUrl || undefined,
    }));

    // 2. Extract quizzes & practice sets
    const quizContainers = module.content.filter(
      (c): c is QuizModuleContent => c.type === "quiz",
    );
    const practiceContainers = module.content.filter(
      (c): c is PracticeModuleContent => c.type === "practice",
    );

    const rawQuestions: CreatPracticeQuestionType[] = [
      ...quizContainers.flatMap((q) => q.questions),
      ...practiceContainers.flatMap((p) => p.questions),
    ];

    const quizzes: ApiQuizQuestionPayload[] = rawQuestions.map((q) => ({
      question_text: q.question,
      description: q.description || undefined,
      question_type: normalizeQuestionType(q.type),
      options: q.options?.map((opt) => opt.text) || [],
      correct_answers:
        q.options?.filter((opt) => opt.isCorrect).map((opt) => opt.text) || [],
      explanation: q.explanation || undefined,
    }));

    return {
      title: module.label || "Untitled Module",
      lectures,
      quizzes,
    };
  });
}

/**
 * Deserializes API ApiModulePayload[] data structure back into UI Topic[]
 * for editing an existing course in Step 2.
 */
export function deserializeModulesPayload(
  apiModules: ApiModulePayload[],
): Topic[] {
  if (!apiModules || apiModules.length === 0) return [];

  const convertedModules: MakeModule[] = apiModules.map((apiMod) => {
    const moduleId = uid();

    // Map lectures back to LessonModuleContent
    const lessons: LessonModuleContent[] = (apiMod.lectures || []).map(
      (lec) => ({
        id: uid(),
        type: "lesson" as const,
        title: lec.title,
        format: lec.file_format || "MP4",
        size: lec.file_size_bytes
          ? `${(lec.file_size_bytes / (1024 * 1024)).toFixed(1)}mb`
          : "0mb",
        fileSizeBytes: lec.file_size_bytes,
        src: lec.video_url,
        previewUrl: lec.video_url,
        thumbnailUrl: lec.thumbnail_url,
        duration: lec.duration_seconds,
      }),
    );

    // Map quizzes back to CreatPracticeQuestionType & QuizModuleContent
    const questions: CreatPracticeQuestionType[] = (apiMod.quizzes || []).map(
      (q) => {
        const correctSet = new Set(q.correct_answers || []);
        const options: Option[] = (q.options || []).map((optText) => ({
          id: uid(),
          text: optText,
          isCorrect: correctSet.has(optText),
        }));

        return {
          id: uid(),
          type: normalizeQuestionType(q.question_type),
          question: q.question_text,
          description: q.description,
          options,
          explanation: q.explanation,
        };
      },
    );

    const quizContent: QuizModuleContent[] =
      questions.length > 0
        ? [
            {
              id: uid(),
              type: "quiz" as const,
              title: "Module Quiz",
              questions,
              settings: {},
            },
          ]
        : [];

    return {
      id: moduleId,
      label: apiMod.title,
      content: [...lessons, ...quizContent],
    };
  });

  return [
    {
      id: uid(),
      label: "Main Topic",
      modules: convertedModules,
    },
  ];
}
