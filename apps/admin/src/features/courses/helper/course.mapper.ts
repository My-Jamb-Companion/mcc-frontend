import {hasResponses, optionResponses} from "@/src/features/question-editor/types";
import {
  AdditionalCourseTypes,
  ApiCourseDetail,
  ApiCourseSummary,
  ApiLecturePayload,
  ApiModulePayload,
  ApiQuizQuestionPayload,
  ApiQuizSettings,
  CoursesFormValues,
  ExerciseModuleContent,
  CourseLevel,
  CreatPracticeQuestionType,
  LessonModuleContent,
  MakeModule,
  Option,
  PracticeModuleContent,
  QuestionTypeApi,
  QuestionUsage,
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

/** What the API calls a quiz set with no name. */
export const DEFAULT_QUIZ_NAME = "Quiz";

/** An already-uploaded file, shaped so the Upload step shows it and counts it as present. */
function remoteFile(url: string | null | undefined) {
  return url ? {previewUrl: url, remoteUrl: url} : null;
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
      lecture_id: lesson.id,
      title: lesson.title,
      content: lesson.content || undefined,
      video_url: lesson.src || lesson.previewUrl || undefined,
      file_format: lesson.format || "MP4",
      file_size_bytes: lesson.fileSizeBytes ?? lesson.file?.size ?? undefined,
      duration_seconds: lesson.duration ?? undefined,
      thumbnail_url: lesson.thumbnailUrl || undefined,
    }));

    // 2. Extract every question set -- quiz, practice and exercise -- in the
    // order the admin arranged them, tagging each question with its kind and
    // the set's name so the editor can rebuild the sets on reload and
    // students can be given exercises as their own entries.
    const quizzes: ApiQuizQuestionPayload[] = module.content.flatMap((c) => {
      if (c.type !== "quiz" && c.type !== "practice" && c.type !== "exercise") return [];
      const setName = c.type === "quiz" ? c.title : c.name;
      return c.questions.map((q: CreatPracticeQuestionType) => ({
        question_text: q.question,
        description: q.description || undefined,
        question_type: normalizeQuestionType(q.type),
        options: q.options?.map((opt) => opt.text) || [],
        correct_answers:
          q.options?.filter((opt) => opt.isCorrect).map((opt) => opt.text) || [],
        explanation: q.explanation || undefined,
        usage_type: c.type as QuestionUsage,
        set_name: setName?.trim() || undefined,
        // Responses belong to Practice only.
        ...(c.type === "practice" && hasResponses(q) ? {option_feedback: optionResponses(q)} : {}),
      }));
    });

    // A quiz's timer and passing score, keyed by the quiz's name (an unnamed
    // quiz is saved as "Quiz", which is what the API calls it too).
    const quizSettings: ApiQuizSettings[] = module.content.flatMap((c) =>
      c.type === "quiz" && (c.settings?.timer || c.settings?.passingScore !== undefined)
        ? [
            {
              set_name: c.title?.trim() || DEFAULT_QUIZ_NAME,
              timer_minutes: c.settings.timer || undefined,
              passing_score: c.settings.passingScore,
            },
          ]
        : [],
    );

    return {
      module_id: module.id,
      title: module.label || "Untitled Module",
      lectures,
      quizzes,
      ...(quizSettings.length > 0 ? {quiz_settings: quizSettings} : {}),
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
    // The module's own id, so saving again updates it instead of replacing it.
    const moduleId = apiMod.module_id ?? uid();

    // Map lectures back to LessonModuleContent
    const lessons: LessonModuleContent[] = (apiMod.lectures || []).map(
      (lec) => ({
        // The lecture's own id, so saving again updates it instead of replacing it: students'
        // progress, notes and bookmarks are tied to that id.
        id: lec.lecture_id ?? uid(),
        type: "lesson" as const,
        title: lec.title,
        format: lec.content ? "HTML" : lec.file_format || "MP4",
        size: lec.file_size_bytes
          ? `${(lec.file_size_bytes / (1024 * 1024)).toFixed(1)}mb`
          : "0mb",
        fileSizeBytes: lec.file_size_bytes,
        src: lec.video_url,
        previewUrl: lec.video_url,
        thumbnailUrl: lec.thumbnail_url,
        duration: lec.duration_seconds,
        content: lec.content,
      }),
    );

    // Map questions back into their sets. Consecutive questions with the same
    // kind and set name were one set when they were saved. Rows saved before
    // sets were recorded carry no kind and become a single practice set.
    const quizSettings = new Map((apiMod.quiz_settings ?? []).map((q) => [q.set_name, q]));
    const sets = new Map<
      string,
      {usage: QuestionUsage; name: string | undefined; questions: CreatPracticeQuestionType[]}
    >();
    for (const q of apiMod.quizzes || []) {
      const usage: QuestionUsage = q.usage_type ?? "practice";
      const name = q.set_name?.trim() || undefined;
      const key = `${usage}|${name ?? ""}`;
      const correctSet = new Set(q.correct_answers || []);
      const options: Option[] = (q.options || []).map((optText, i) => ({
        id: uid(),
        text: optText,
        isCorrect: correctSet.has(optText),
        ...(usage === "practice" && q.option_feedback?.[i] ? {response: q.option_feedback[i] as string} : {}),
      }));
      const question: CreatPracticeQuestionType = {
        id: uid(),
        type: normalizeQuestionType(q.question_type),
        question: q.question_text,
        description: q.description,
        options,
        explanation: q.explanation,
      };
      const existing = sets.get(key);
      if (existing) existing.questions.push(question);
      else sets.set(key, {usage, name, questions: [question]});
    }

    const questionSets: Array<
      PracticeModuleContent | QuizModuleContent | ExerciseModuleContent
    > = [...sets.values()].map(({usage, name, questions}) => {
      if (usage === "quiz") {
        const saved = quizSettings.get(name ?? DEFAULT_QUIZ_NAME);
        return {
          id: uid(),
          type: "quiz" as const,
          title: name ?? DEFAULT_QUIZ_NAME,
          questions,
          settings: {
            timer: saved?.timer_minutes ?? undefined,
            passingScore: saved?.passing_score ?? undefined,
          },
        };
      }
      if (usage === "exercise") {
        return {id: uid(), type: "exercise" as const, name: name ?? "Exercise", questions};
      }
      return {id: uid(), type: "practice" as const, name: name ?? "Practice", questions};
    });

    return {
      id: moduleId,
      label: apiMod.title,
      content: [...lessons, ...questionSets],
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
export function fromApiCourseSummary(
  api: ApiCourseSummary,
): CoursesFormValues & Partial<AdditionalCourseTypes> {
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
    // Display the teacher's full_name on the courses list page (falls back to email or user_id)
    instructorName:
      api.teacher?.full_name || api.teacher?.email || api.teacher?.user_id || "",
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
    instructor: api.teacher
      ? {
          id: api.teacher.user_id,
          name: api.teacher.full_name || api.teacher.email || api.teacher.user_id,
          bio: "",
          avatar: api.teacher.avatar_url ?? "",
          role: "Instructor",
          social: [],
        }
      : undefined,
    cover_image_url: api.cover_image_url ?? undefined,
  };
}

/**
 * Adapts GET /admin/courses/{course_id} into CoursesFormValues, ready to
 * be passed straight into methods.reset(...).
 */
export function fromApiCourseDetail(
  api: ApiCourseDetail,
): CoursesFormValues & Partial<AdditionalCourseTypes> {
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
      // Already-uploaded media is a real file as far as the form is concerned:
      // without these, Publish and "View as a student" stay disabled on an
      // existing course until both files are uploaded again.
      coverImage: remoteFile(api.cover_image_url),
      promoVideo: remoteFile(api.promo_video_url),
      coverImageUrl: api.cover_image_url ?? undefined,
      promoVideoUrl: api.promo_video_url ?? undefined,
    },
    instructor: api.teacher
      ? {
          id: api.teacher.user_id,
          name: api.teacher.full_name || api.teacher.email || api.teacher.user_id,
          bio: "",
          avatar: api.teacher.avatar_url ?? "",
          role: "Instructor",
          social: [],
        }
      : undefined,
    cover_image_url: api.cover_image_url ?? undefined,
    promo_video_url: api.promo_video_url ?? undefined,
  };
}
