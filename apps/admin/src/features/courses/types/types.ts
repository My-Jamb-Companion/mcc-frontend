// FORM TYPES

export const LEVELS = [
  {id: "all", label: "All levels", fill: 0},
  {id: "beginner", label: "Beginner", fill: 0.33},
  {id: "intermediate", label: "Intermediate", fill: 0.66},
  {id: "advanced", label: "Advanced", fill: 1},
] as const;

export type CourseLevel = (typeof LEVELS)[number]["id"];

export type Step1Values = {
  id: string;
  status: string;
  courseName: string;
  category: string;
  instructorName: string;
  price: string;
  level: CourseLevel;
  description: string;
  learnItems: string[];
  tags: string[];
};

export type CoursesFormValues = Step1Values & {
  content: {
    topics: Topic[];
  };
  upload: {
    coverImage: UploadedFile | null;
    promoVideo: UploadedFile | null;
    coverImageUrl?: string;
    promoVideoUrl?: string;
  };
};

export type AdditionalCourseTypes = {
  stats?: {
    students?: number;
    practiceTests?: number;
    additionalResources?: number;
    downloadableResources?: number;
    rating?: number;
    enrolledStudents?: number;
    reviewCount?: number;
    totalHours?: number;
  };
  features?: {
    assignments?: boolean;
    mobileAndTVAccess?: boolean;
    fullLifetimeAccess?: boolean;
    certificateOnCompletion?: boolean;
  };

  currency?: string;
  originalPrice?: number;
  modulePrice?: number;
  instructor?: {
    id: string;
    name: string;
    bio: string;
    avatar: string;
    role: string;
    social: {name: string; link: string}[];
  };
  availableLanguage?: string[];
  certificate?: string;
  lastUpdated?: string;
  cover_image_url?: string;
  promo_video_url?: string;
};

// STEP 2 TYPES
export type PracticeSet = {
  id: string;
  name: string;
  questions: CreatPracticeQuestionType[];
};

// A lesson entry in a module's content IS the file itself.
export type LessonModuleContent = FileRow & {type: "lesson"};

// A practice entry in a module's content IS the named practice set itself.
export type PracticeModuleContent = PracticeSet & {type: "practice"};

// A quiz entry in a module's content IS the quiz itself (no separate
// wrapper id/title — this object's own id/title are what's used).
export type QuizModuleContent = {
  id: string;
  type: "quiz";
  title: string;
  questions: CreatPracticeQuestionType[];
  settings: {
    timer?: number;
    passingScore?: number;
  };
};

export type ExerciseSet = {
  id: string;
  name: string;
  questions: CreatPracticeQuestionType[];
};

export type ExerciseModuleContent = ExerciseSet & {type: "exercise"};

export type ModuleContent =
  | LessonModuleContent
  | PracticeModuleContent
  | QuizModuleContent
  | ExerciseModuleContent;

export type MakeModule = {
  id: string;
  label: string;
  description?: string;
  content: ModuleContent[];
};

export type Topic = {
  id: string;
  label: string;
  description?: string;
  modules: MakeModule[];
};

export type ContentFormValues = {
  content: {
    topics: Topic[];
  };
};

export type FileRow = {
  id: string;
  title: string;
  format: string;
  size: string;
  fileSizeBytes?: number;
  progress?: number;
  previewUrl?: string;
  src?: string;
  thumbnailUrl?: string;
  duration?: number;
  file?: File;
};

// Course structure strictly matching Step2 data models
export interface CourseDetail {
  id: string;
  title: string;
  description?: string;
  topics: Topic[];
}

// STEP 3 TYPES

export type UploadedFile = {
  file?: File;
  previewUrl: string;
  remoteUrl?: string;
};

// PRACTICE TYPES
export interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string | string[];
  explanation: string;
  multiSelect?: boolean;
}

export interface SubmittedAnswer {
  id: string;
  question: string;
  answer: string | string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface PracticeCardProps {
  questions: Question[];
  onComplete?: (answers: SubmittedAnswer[]) => void;
  reviewMode?: boolean;
  submittedAnswers?: SubmittedAnswer[];
  endReview?: () => void;
  onDone?: () => void;
}

export interface QuizItem {
  id: string;
  question: string;
  answer: string | string[];
  correctAnswer: string | string[];
}

export interface QuizResultsProps {
  review: QuizItem[];
  onRetry?: () => void;
  onReview?: () => void;
  onDone?: () => void;
}

export type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuestionTypeApi =
  | "single_choice"
  | "multi_choice"
  | "long_short_answer";

export type CreatPracticeQuestionType = {
  id: string;
  type: "single" | "multiple" | QuestionTypeApi;
  question: string;
  description?: string;
  options: Option[];
  explanation?: string;
};

// API PAYLOAD TYPES MATCHING BACKEND SCHEMA
export interface ApiLecturePayload {
  title: string;
  video_url?: string;
  file_format?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
}

export interface ApiQuizQuestionPayload {
  question_text: string;
  description?: string;
  question_type: QuestionTypeApi;
  options?: string[];
  correct_answers?: string[];
  explanation?: string;
  image_url?: string;
}

export interface ApiModulePayload {
  title: string;
  lectures: ApiLecturePayload[];
  quizzes: ApiQuizQuestionPayload[];
}

export interface UpdateCoursePayload {
  title?: string;
  category?: string;
  teacher_id?: string;
  price?: number;
  level?: string;
  description?: string;
  learning_outcomes?: string[];
  tags?: string[];
  cover_image_url?: string;
  promo_video_url?: string;
  modules?: ApiModulePayload[];
}

// ─────────────────────────────────────────────
// GET /admin/courses & GET /admin/courses/{id}
// ─────────────────────────────────────────────

export interface ApiEnvelope<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Query params match app/features/admin/courses/router.py:list_courses exactly
// — note it's `limit`/`teacher_id`/`category_id`/`search`, not `per_page`/`category`.
export interface ListCoursesParams {
  page?: number;
  limit?: number;
  status?: "draft" | "published";
  teacher_id?: string;
  category_id?: string;
  search?: string;
}

export interface ApiTeacher {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export interface ApiCourseSummary {
  course_id: string;
  title: string;
  category: string | null;
  level: string;
  price: string;
  status: "draft" | "published";
  tags: string[];
  cover_image_url: string | null;
  modules_count: number;
  rating: string | null;
  teacher: ApiTeacher | null;
  created_at: string;
}

export interface ApiCourseDetail extends Omit<ApiCourseSummary, "category"> {
  category: {category_id: string; name: string} | null;
  description: string;
  learning_outcomes: string[];
  promo_video_url: string | null;
  modules: ApiModulePayload[];
  updated_at: string;
}

