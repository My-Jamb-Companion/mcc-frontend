import {
  ApiCourseDetail,
  ApiCourseSummary,
  ApiLecturePayload,
  ApiModulePayload,
  ApiQuizQuestionPayload,
  CoursesFormValues,
  CourseLevel,
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

/**
 * Maps course level between the UI's values (`LEVELS` in types.ts, used for
 * the "all levels" fill-bar control) and the backend's Pydantic enum
 * (`app/features/admin/courses/schemas.py::CourseLevel`), which spells the
 * "no preference" option `all_levels`, not `all`. Sending `"all"` straight
 * through fails the backend's validation on every course creation/update
 * where the level was left at its default.
 */
const API_LEVEL_TO_UI: Record<string, CourseLevel> = {
  all_levels: "all",
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

const UI_LEVEL_TO_API: Record<CourseLevel, string> = {
  all: "all_levels",
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

export function fromApiLevel(level: string): CourseLevel {
  return API_LEVEL_TO_UI[level] ?? "all";
}

export function toApiLevel(level: CourseLevel): string {
  return UI_LEVEL_TO_API[level] ?? "all_levels";
}

/**
 * Adapts one GET /admin/courses list item into CoursesFormValues so
 * CourseCard / CoursesRow / CourseLists never learn the API's key names.
 */
export function fromApiCourseSummary(api: ApiCourseSummary): CoursesFormValues {
  return {
    id: api.course_id,
    status: api.status,
    courseName: api.title,
    // Category <select> options (Step1.tsx CATEGORY_OPTIONS) match by a
    // lowercase value ("science"), but the API stores/returns the
    // display-cased name ("Science") the create flow originally sent —
    // lowercase it here so an existing course's category shows as
    // selected instead of blank. Placeholder-options only; revisit once
    // categories are fetched from a real endpoint instead of hardcoded.
    category: api.category?.toLowerCase() ?? "",
    // The Instructor <select> (Step1.tsx) matches options by teacher_id,
    // not display name — despite the field's name, `instructorName` holds
    // an id everywhere else in this codebase too (it's sent back to the
    // API as `teacher_id`). Mapping the display name here left the
    // dropdown unable to match any option and show as unselected on edit.
    instructorName: api.teacher?.user_id ?? "",
    price: api.price,
    level: fromApiLevel(api.level),
    description: "",
    learnItems: [],
    tags: api.tags ?? [],
    content: {topics: []},
    upload: {
      coverImage: null,
      promoVideo: null,
      coverImageUrl: api.cover_image_url ?? undefined,
    },
  };
}

/**
 * Adapts GET /admin/courses/{course_id} into CoursesFormValues, ready to
 * be passed straight into methods.reset(...).
 */
export function fromApiCourseDetail(api: ApiCourseDetail): CoursesFormValues {
  return {
    id: api.course_id,
    status: api.status,
    courseName: api.title,
    // See the matching comment in fromApiCourseSummary — lowercased to
    // match CATEGORY_OPTIONS' placeholder values.
    category: api.category?.name?.toLowerCase() ?? "",
    // The Instructor <select> (Step1.tsx) matches options by teacher_id,
    // not display name — despite the field's name, `instructorName` holds
    // an id everywhere else in this codebase too (it's sent back to the
    // API as `teacher_id`). Mapping the display name here left the
    // dropdown unable to match any option and show as unselected on edit.
    instructorName: api.teacher?.user_id ?? "",
    price: api.price,
    level: fromApiLevel(api.level),
    description: api.description,
    learnItems: api.learning_outcomes ?? [],
    tags: api.tags ?? [],
    content: {topics: deserializeModulesPayload(api.modules)},
    upload: {
      coverImage: null,
      promoVideo: null,
      coverImageUrl: api.cover_image_url ?? undefined,
      promoVideoUrl: api.promo_video_url ?? undefined,
    },
  };
}
