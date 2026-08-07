// FORM TYPES

export const LEVELS = [
  {id: "all", label: "All levels", fill: 0},
  {id: "beginner", label: "Beginner", fill: 0.33},
  {id: "intermediate", label: "Intermediate", fill: 0.66},
  {id: "advanced", label: "Advanced", fill: 1},
] as const;

export type CourseLevel = (typeof LEVELS)[number]["id"];

export type Step1Values = {
  courseName: string;
  category: string;
  instructor: string;
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
  };
};

export type AdditionalCourseTypes = {
  rating?: number;
  enrolledStudents?: number;
  reviewCount?: number;
  hours?: number;
  instructorBio?: string;
  instructorAvatar?: string;
  instructorRole?: string;
  instructorSocial?: {name: string; link: string}[];
  availableLanguage?: string[];
  certificate?: string;
  lastUpdated?: string;
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

export type ModuleContent =
  | LessonModuleContent
  | PracticeModuleContent
  | QuizModuleContent;

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
  progress?: number;
  previewUrl?: string;
  src?: string;
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
  file: File;
  previewUrl: string;
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

export type CreatPracticeQuestionType = {
  id: string;
  type: "single" | "multiple";
  question: string;
  description?: string;
  options: Option[];
  explanation?: string;
};
