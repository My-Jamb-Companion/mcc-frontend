"use client";

import {useCallback, useState} from "react";
import {
  CoursesFormValues,
  CreatPracticeQuestionType,
  ExerciseModuleContent,
  FileRow,
  LessonModuleContent,
  MakeModule,
  ModuleContent,
  PracticeModuleContent,
  QuizModuleContent,
  Topic,
} from "../types/types";

const STORAGE_KEY = "mcc_courses";

export type CourseStatus = "draft" | "published";

export function uid(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ─────────────────────────────────────────────
// DEFAULT COURSE
// ─────────────────────────────────────────────

function createDefaultDraft(): CoursesFormValues {
  return {
    id: uid(),
    status: "draft",

    courseName: "",
    category: "",
    instructorName: "",
    price: "",
    level: "all",
    description: "",
    learnItems: [],
    tags: [],

    content: {
      topics: [],
    },

    upload: {
      coverImage: null,
      promoVideo: null,
    },
  };
}

// ─────────────────────────────────────────────
// QUESTIONABLE CONTENT
// ─────────────────────────────────────────────

type QuestionableContent =
  | PracticeModuleContent
  | ExerciseModuleContent
  | QuizModuleContent;

function hasQuestions(content: ModuleContent): content is QuestionableContent {
  return (
    content.type === "practice" ||
    content.type === "exercise" ||
    content.type === "quiz"
  );
}

// ─────────────────────────────────────────────
// LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────

function loadCourses(): CoursesFormValues[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load courses from localStorage", error);

    return [];
  }
}

function saveCourses(courses: CoursesFormValues[]): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));

    return true;
  } catch (error) {
    console.error("Failed to save courses to localStorage", error);

    return false;
  }
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useCourseData() {
  // All saved courses
  const [courses, setCourses] = useState<CoursesFormValues[]>(() =>
    loadCourses(),
  );

  // Currently opened/edited course
  const [draft, setDraft] = useState<CoursesFormValues>(() =>
    createDefaultDraft(),
  );

  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // ─────────────────────────────────────────────
  // TOP-LEVEL FIELDS
  // ─────────────────────────────────────────────

  const setField = useCallback(
    <K extends keyof CoursesFormValues>(
      key: K,
      value: CoursesFormValues[K],
    ) => {
      setDraft((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const topics = draft.content.topics;

  const setTopics = useCallback(
    (next: Topic[] | ((prev: Topic[]) => Topic[])) => {
      setDraft((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          topics: typeof next === "function" ? next(prev.content.topics) : next,
        },
      }));
    },
    [],
  );

  // ─────────────────────────────────────────────
  // COURSE MANAGEMENT
  // ─────────────────────────────────────────────

  /**
   * Create a completely new course.
   *
   * This does NOT save it yet.
   */
  const createCourse = useCallback(() => {
    const newCourse = createDefaultDraft();

    setDraft(newCourse);
    setLastSavedAt(null);

    return newCourse;
  }, []);

  /**
   * Get one course by ID.
   */
  const getCourse = useCallback(
    (courseId: string) => {
      return courses.find((course) => course.id === courseId);
    },
    [courses],
  );

  /**
   * Open an existing course.
   *
   * This takes a course from the courses array
   * and puts it into the current draft.
   */
  const openCourse = useCallback(
    (courseId: string) => {
      const course = courses.find((item) => item.id === courseId);

      if (!course) {
        return null;
      }

      setDraft(course);
      setLastSavedAt(null);

      return course;
    },
    [courses],
  );

  /**
   * Get courses by status.
   */
  const getCoursesByStatus = useCallback(
    (status: CourseStatus) => {
      return courses.filter((course) => course.status === status);
    },
    [courses],
  );

  /**
   * Save/update a course inside the courses array.
   */
  const upsertCourse = useCallback((course: CoursesFormValues) => {
    setCourses((prev) => {
      const exists = prev.some((item) => item.id === course.id);

      const updated = exists
        ? prev.map((item) => (item.id === course.id ? course : item))
        : [...prev, course];

      saveCourses(updated);

      return updated;
    });
  }, []);

  const saveDraft = useCallback(
    (courseData?: CoursesFormValues) => {
      const courseToSave: CoursesFormValues = {
        ...(courseData ?? draft),
        status: "draft",
      };

      setDraft(courseToSave);
      upsertCourse(courseToSave);
      setLastSavedAt(Date.now());

      return courseToSave;
    },
    [draft, upsertCourse],
  );

  const publish = useCallback(
    (courseData?: CoursesFormValues) => {
      const courseToPublish: CoursesFormValues = {
        ...(courseData ?? draft),
        status: "published",
      };

      setDraft(courseToPublish);
      upsertCourse(courseToPublish);
      setLastSavedAt(Date.now());

      return courseToPublish;
    },
    [draft, upsertCourse],
  );
  /**
   * Delete a course permanently.
   */
  const deleteCourse = useCallback(
    (courseId: string) => {
      setCourses((prev) => {
        const updated = prev.filter((course) => course.id !== courseId);

        saveCourses(updated);

        return updated;
      });

      // If the deleted course is currently open,
      // start a fresh course.
      if (draft.id === courseId) {
        setDraft(createDefaultDraft());
        setLastSavedAt(null);
      }
    },
    [draft.id],
  );

  /**
   * Clear everything.
   *
   * This deletes ALL courses.
   */
  const clearAll = useCallback(() => {
    setCourses([]);
    setDraft(createDefaultDraft());
    setLastSavedAt(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // ─────────────────────────────────────────────
  // TOPIC CRUD
  // ─────────────────────────────────────────────

  const addTopic = useCallback(
    (label: string = ""): Topic => {
      const newTopic: Topic = {
        id: uid(),
        label,
        modules: [],
      };

      setTopics((prev) => [...prev, newTopic]);

      return newTopic;
    },
    [setTopics],
  );

  const updateTopic = useCallback(
    (topicId: string, updates: Partial<Omit<Topic, "id" | "modules">>) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId ? {...topic, ...updates} : topic,
        ),
      );
    },
    [setTopics],
  );

  const deleteTopic = useCallback(
    (topicId: string) => {
      setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
    },
    [setTopics],
  );

  const getTopic = useCallback(
    (topicId: string) => topics.find((topic) => topic.id === topicId),
    [topics],
  );

  // ─────────────────────────────────────────────
  // MODULE CRUD
  // ─────────────────────────────────────────────

  const addModule = useCallback(
    (topicId: string, label: string = ""): MakeModule => {
      const newModule: MakeModule = {
        id: uid(),
        label,
        content: [],
      };

      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: [...topic.modules, newModule],
              }
            : topic,
        ),
      );

      return newModule;
    },
    [setTopics],
  );

  const updateModule = useCallback(
    (
      topicId: string,
      moduleId: string,
      updates: Partial<Omit<MakeModule, "id" | "content">>,
    ) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        ...updates,
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const deleteModule = useCallback(
    (topicId: string, moduleId: string) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.filter(
                  (module) => module.id !== moduleId,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const getModule = useCallback(
    (topicId: string, moduleId: string) =>
      getTopic(topicId)?.modules.find((module) => module.id === moduleId),
    [getTopic],
  );

  const getAllModules = useCallback(
    () => topics.flatMap((topic) => topic.modules),
    [topics],
  );

  // ─────────────────────────────────────────────
  // CONTENT
  // ─────────────────────────────────────────────

  const addContentItem = useCallback(
    (topicId: string, moduleId: string, item: ModuleContent) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        content: [...module.content, item],
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const updateContentItem = useCallback(
    (
      topicId: string,
      moduleId: string,
      contentId: string,
      updates: Partial<ModuleContent>,
    ) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        content: module.content.map((content) =>
                          content.id === contentId
                            ? ({
                                ...content,
                                ...updates,
                              } as ModuleContent)
                            : content,
                        ),
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const deleteContentItem = useCallback(
    (topicId: string, moduleId: string, contentId: string) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        content: module.content.filter(
                          (content) => content.id !== contentId,
                        ),
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const reorderModuleContent = useCallback(
    (topicId: string, moduleId: string, newContent: ModuleContent[]) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        content: newContent,
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const getContentItem = useCallback(
    (topicId: string, moduleId: string, contentId: string) =>
      getModule(topicId, moduleId)?.content.find(
        (content) => content.id === contentId,
      ),
    [getModule],
  );

  // ─────────────────────────────────────────────
  // TYPED CONTENT CREATORS
  // ─────────────────────────────────────────────

  const addLesson = useCallback(
    (
      topicId: string,
      moduleId: string,
      fileData: Omit<FileRow, "id">,
    ): LessonModuleContent => {
      const lesson: LessonModuleContent = {
        ...fileData,
        id: uid(),
        type: "lesson",
      };

      addContentItem(topicId, moduleId, lesson);

      return lesson;
    },
    [addContentItem],
  );

  const addPractice = useCallback(
    (
      topicId: string,
      moduleId: string,
      name: string = "",
      questions: CreatPracticeQuestionType[] = [],
    ): PracticeModuleContent => {
      const practice: PracticeModuleContent = {
        id: uid(),
        type: "practice",
        name,
        questions,
      };

      addContentItem(topicId, moduleId, practice);

      return practice;
    },
    [addContentItem],
  );

  const addExercise = useCallback(
    (
      topicId: string,
      moduleId: string,
      name: string = "",
      questions: CreatPracticeQuestionType[] = [],
    ): ExerciseModuleContent => {
      const exercise: ExerciseModuleContent = {
        id: uid(),
        type: "exercise",
        name,
        questions,
      };

      addContentItem(topicId, moduleId, exercise);

      return exercise;
    },
    [addContentItem],
  );

  const addQuiz = useCallback(
    (
      topicId: string,
      moduleId: string,
      title: string = "",
      questions: CreatPracticeQuestionType[] = [],
      settings: {
        timer?: number;
        passingScore?: number;
      } = {},
    ): QuizModuleContent => {
      const quiz: QuizModuleContent = {
        id: uid(),
        type: "quiz",
        title,
        questions,
        settings,
      };

      addContentItem(topicId, moduleId, quiz);

      return quiz;
    },
    [addContentItem],
  );

  // ─────────────────────────────────────────────
  // QUESTIONS
  // ─────────────────────────────────────────────

  const addQuestion = useCallback(
    (
      topicId: string,
      moduleId: string,
      contentId: string,
      question: Omit<CreatPracticeQuestionType, "id">,
    ): CreatPracticeQuestionType => {
      const newQuestion = {
        ...question,
        id: uid(),
      } as CreatPracticeQuestionType;

      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        content: module.content.map((content) =>
                          content.id === contentId && hasQuestions(content)
                            ? {
                                ...content,
                                questions: [...content.questions, newQuestion],
                              }
                            : content,
                        ),
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );

      return newQuestion;
    },
    [setTopics],
  );

  const updateQuestion = useCallback(
    (
      topicId: string,
      moduleId: string,
      contentId: string,
      questionId: string,
      updates: Partial<Omit<CreatPracticeQuestionType, "id">>,
    ) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        content: module.content.map((content) =>
                          content.id === contentId && hasQuestions(content)
                            ? {
                                ...content,
                                questions: content.questions.map((question) =>
                                  question.id === questionId
                                    ? {
                                        ...question,
                                        ...updates,
                                      }
                                    : question,
                                ),
                              }
                            : content,
                        ),
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const deleteQuestion = useCallback(
    (
      topicId: string,
      moduleId: string,
      contentId: string,
      questionId: string,
    ) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        content: module.content.map((content) =>
                          content.id === contentId && hasQuestions(content)
                            ? {
                                ...content,
                                questions: content.questions.filter(
                                  (question) => question.id !== questionId,
                                ),
                              }
                            : content,
                        ),
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const reorderQuestions = useCallback(
    (
      topicId: string,
      moduleId: string,
      contentId: string,
      newQuestions: CreatPracticeQuestionType[],
    ) => {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                modules: topic.modules.map((module) =>
                  module.id === moduleId
                    ? {
                        ...module,
                        content: module.content.map((content) =>
                          content.id === contentId && hasQuestions(content)
                            ? {
                                ...content,
                                questions: newQuestions,
                              }
                            : content,
                        ),
                      }
                    : module,
                ),
              }
            : topic,
        ),
      );
    },
    [setTopics],
  );

  const getQuestion = useCallback(
    (
      topicId: string,
      moduleId: string,
      contentId: string,
      questionId: string,
    ) => {
      const content = getContentItem(topicId, moduleId, contentId);

      if (!content || !hasQuestions(content)) {
        return undefined;
      }

      return content.questions.find((question) => question.id === questionId);
    },
    [getContentItem],
  );

  // ─────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────

  return {
    // All saved courses
    courses,

    // Current/open course
    draft,

    // Current course topics
    topics,

    // Top-level fields
    setField,
    setTopics,

    // Course management
    createCourse,
    getCourse,
    openCourse,
    getCoursesByStatus,
    saveDraft,
    publish,
    deleteCourse,
    clearAll,

    // Save state
    lastSavedAt,

    // Topics
    addTopic,
    updateTopic,
    deleteTopic,
    getTopic,

    // Modules
    addModule,
    updateModule,
    deleteModule,
    getModule,
    getAllModules,

    // Generic content
    addContentItem,
    updateContentItem,
    deleteContentItem,
    reorderModuleContent,
    getContentItem,

    // Typed content
    addLesson,
    addPractice,
    addExercise,
    addQuiz,

    // Questions
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    getQuestion,
  };
}
