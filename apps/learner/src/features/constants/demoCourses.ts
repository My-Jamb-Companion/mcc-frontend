export const demoCourses = [
  {
    id: 1,
    topic: "Unit 4: Figure of speech",
    course: "WAEC: English Language",
    img: "https://picsum.photos/200/300",
    completed: 75,
  },
  {
    id: 2,
    topic: "Advanced Python for Data Science",
    course: "Phyton for Data Science",
    img: "https://picsum.photos/200/300",
    completed: 45,
  },
  {
    id: 3,
    topic: "UI/UX Design Fundamentals",
    course: "Figma Fundamentals",
    img: "https://picsum.photos/200/300",
    completed: 90,
  },
  {
    id: 4,
    topic: "Mastering React and Next.js",
    course: "Web Development",
    img: "https://picsum.photos/200/300",
    completed: 20,
  },
  {
    id: 5,
    topic: "Digital Marketing Strategy",
    course: "Marketing Fundamentals",
    img: "https://picsum.photos/200/300",
    completed: 60,
  },
];

export type Difficulty = "Beginner" | "Moderate" | "Advanced";

export type CurriculumSection = {
  id: string;
  title: string;
  isOpen: boolean;
  description?: string;
  lessons: string[];
};

export interface CourseDetail {
  id: number;
  slug: string;
  instructor: string;
  title: string;
  description: string;

  imgBig: string;
  imgSmall: string;

  price: number;
  originalPrice: number;
  pricePerModule: number;
  currency: string;
  isEnrolled: boolean;

  rating: number;
  reviewCount: number;

  tags: string[];
  extraTagsCount: number;

  previewVideo: string;
  totalRatings: number;

  meta: {
    lessons: number;
    difficulty: Difficulty;
  };

  stats: {
    students: number;
    hoursOfVideo: number;
    practiceTests: number;
    additionalResources: number;
    downloadableResources: number;
  };

  features: {
    assignments: boolean;
    mobileAndTVAccess: boolean;
    fullLifetimeAccess: boolean;
    certificateOnCompletion: boolean;
  };

  enrolledStudents: number;
  hours: number;
  lastUpdated: string;
  certificate: string;
  instructorBio: string;
  instructorAvatar: string;
  instructorSocial: {name: string; link: string}[];
  availableLanguage: string[];
  instructorRole: string;

  curriculum: CurriculumSection[];
  curriculums: CourseLevel[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const videoSrcs = [
  "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
];

const getRandomSrc = () =>
  videoSrcs[Math.floor(Math.random() * videoSrcs.length)];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LessonType = "video" | "doc" | "practice" | "exam" | "exercise";

export interface Lessons {
  id: string;
  title: string;
  duration?: number; // Duration in seconds
  src?: string;
  type: LessonType;
  completed: boolean;
  currentTime?: number;
  practice?: {
    id: string;
    label: string;
    title: string;
    question: string;
    correctAnswer: string;
  }[];

  exercise?: {
    passingScore: number;
    maxAttempts: number;
    attempts: number;
    score: number;
    passed: boolean;
    questions: {
      id: string;
      question: string;
      answers: string[];
      hint: string;
      correctAnswer: string;
    }[];
  };

  exam?: {
    passingScore: number;
    maxAttempts: number;
    attempts: number;
    score: number;
    passed: boolean;
    questions: {
      id: string;
      question: string;
      answers: string[];
      correctAnswer: string;
    }[];
  };
}

export interface CourseModule {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  lessons: Lessons[];
}

export interface CourseLevel {
  id: string;
  title: string;
  progress: number;
  modules: CourseModule[];
}

// ---------------------------------------------------------------------------
// courseDetails
// ---------------------------------------------------------------------------

export const courseDetails: CourseDetail[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Pilates Teacher Training
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 323,
    slug: "pilates-teacher-training",
    instructor: "Benedict Laura",
    title: "Pilates Teacher Training Certification 20 CPD Points",
    description:
      "Realise your dreams and train to be a Classical Mat Pilates instructor with this accredited Teacher Training course",

    imgBig: "/assets/images/courses/pilatis-big.jpg",
    imgSmall: "/assets/images/courses/pilatis-small.jpg",

    price: 2345,
    originalPrice: 3500,
    pricePerModule: 75.95,
    currency: "₦",
    isEnrolled: true,

    rating: 4.7,
    reviewCount: 5231,

    tags: ["Procreate", "Drawing Tablet", "Beginner", "Digital Art", "iPad"],
    extraTagsCount: 8,

    previewVideo: "/videos/pilates-preview.mp4",
    totalRatings: 254,

    meta: {lessons: 16, difficulty: "Moderate"},

    stats: {
      students: 343,
      hoursOfVideo: 13,
      practiceTests: 2,
      additionalResources: 11,
      downloadableResources: 24,
    },

    features: {
      assignments: true,
      mobileAndTVAccess: true,
      fullLifetimeAccess: true,
      certificateOnCompletion: true,
    },

    enrolledStudents: 343,
    hours: 13,
    lastUpdated: "2026-05-12",
    certificate: "",
    instructorBio:
      "Benedict Laura is a certified Classical Pilates instructor with over 12 years of teaching experience, specializing in mat-based training and instructor certification programs. She has trained hundreds of students who now teach professionally across studios and gyms worldwide.",
    instructorAvatar: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,
    instructorSocial: [
      {name: "Instagram", link: "https://instagram.com/benedictlaura"},
      {name: "LinkedIn", link: "https://linkedin.com/in/benedictlaura"},
      {name: "YouTube", link: "https://youtube.com/@benedictlaura"},
    ],
    availableLanguage: ["English"],
    instructorRole: "Lead Pilates Instructor & Course Creator",

    curriculum: [
      {id: "intro", title: "Introduction", isOpen: false, lessons: []},
      {
        id: "basics",
        title: "Basics of Pilates",
        isOpen: true,
        description: "The course description...",
        lessons: [],
      },
      {
        id: "fundamentals",
        title: "Fundamentals of Pilates",
        isOpen: false,
        lessons: [],
      },
    ],

    curriculums: [
      {
        id: "foundation",
        title: "Beginner level",
        progress: 12,
        modules: [
          {
            id: "basics",
            title: "Introduction to Pilates",
            completed: false,
            progress: 0,
            lessons: [
              {
                id: "Welcome to the Course",
                title: "Welcome to the Course",
                duration: 122,
                src: getRandomSrc(),
                type: "video",
                completed: true,
                currentTime: 127,
              },
              {
                id: "Course Aims & Objectives",
                title: "Course Aims & Objectives",
                duration: 182,
                src: getRandomSrc(),
                type: "video",
                completed: true,
                currentTime: 127,
              },
              {
                id: "History of Pilates",
                title: "History of Pilates",
                duration: 734,
                src: getRandomSrc(),
                type: "video",
                completed: true,
                currentTime: 127,
              },
              {
                id: "Understanding Core Principles",
                title: "Understanding Core Principles",
                duration: 1125,
                src: getRandomSrc(),
                type: "video",
                completed: true,
                currentTime: 856,
              },
              {
                id: "Teaching Rules & Regulations",
                title: "Teaching Rules & Regulations",
                duration: 1945,
                src: getRandomSrc(),
                type: "video",
                completed: true,
                currentTime: 1597,
              },
              {
                id: "Certification Information",
                title: "Certification Information",
                duration: 176,
                src: getRandomSrc(),
                type: "doc",
                completed: true,
                currentTime: 107,
              },
              {
                id: "Student Guide to MCC",
                title: "Student Guide to MCC",
                duration: 49,
                src: getRandomSrc(),
                type: "doc",
                completed: true,
                currentTime: 14,
              },
            ],
          },
          {
            id: "Body Awareness & Posture",
            title: "Body Awareness & Posture",
            completed: false,
            progress: 0,
            lessons: [
              {
                id: "Introduction to Alignment",
                title: "Introduction to Alignment",
                duration: 645,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Neutral Spine Explained",
                title: "Neutral Spine Explained",
                duration: 862,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Understanding Pelvic Position",
                title: "Understanding Pelvic Position",
                duration: 594,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Quick practice",
                title: "Quick Practice",
                src: getRandomSrc(),
                type: "practice",
                completed: false,
              },
              {
                id: "Breathing Fundamentals",
                title: "Breathing Fundamentals",
                duration: 690,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Improving Posture Daily",
                title: "Improving Posture Daily",
                duration: 968,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Common Beginner Mistakes",
                title: "Common Beginner Mistakes",
                duration: 522,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Posture Assessment Worksheet",
                title: "Posture Assessment Worksheet",
                duration: 255,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },

              {
                id: "Module Exercise",
                title: "Module Exercise",
                src: getRandomSrc(),
                type: "exercise",
                completed: false,
                exercise: {
                  passingScore: 70,
                  maxAttempts: 3,
                  attempts: 0,
                  score: 0,
                  passed: false,
                  questions: [
                    {
                      id: "exam-1",
                      question: "A good instructor should?",
                      answers: [
                        "Adapt exercises to clients",
                        "Ignore needs",
                        "Use one method only",
                        "Avoid feedback",
                      ],
                      correctAnswer: "Adapt exercises to clients",
                      hint: "Think about putting the client's individual needs, abilities, and goals first rather than using the same approach for everyone.",
                    },

                    {
                      id: "exam-2",
                      question: "Client assessment helps create?",
                      answers: [
                        "Safe programs",
                        "Random workouts",
                        "Competition",
                        "Pressure",
                      ],
                      correctAnswer: "Safe programs",
                      hint: "An assessment is performed before training begins to ensure the exercise plan is appropriate and minimizes the risk of injury.",
                    },

                    {
                      id: "exam-3",
                      question: "Effective coaching requires?",
                      answers: [
                        "Clear communication",
                        "Silence",
                        "Confusion",
                        "No feedback",
                      ],
                      correctAnswer: "Clear communication",
                      hint: "A coach should make instructions easy to understand and encourage two-way interaction with clients.",
                    },

                    {
                      id: "exam-4",
                      question: "A personal brand helps build?",
                      answers: [
                        "Trust and recognition",
                        "Confusion",
                        "Avoidance",
                        "Isolation",
                      ],
                      correctAnswer: "Trust and recognition",
                      hint: "Consider what makes clients remember you and feel confident choosing your services over others.",
                    },
                  ],
                },
              },
            ],
          },
          {
            id: "Beginner Movement Training",
            title: "Beginner Movement Training",
            completed: false,
            progress: 0,
            lessons: [
              {
                id: "Warm-Up Techniques",
                title: "Warm-Up Techniques",
                duration: 455,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Basic Mat Exercises",
                title: "Basic Mat Exercises",
                duration: 1278,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Controlled Leg Movements",
                title: "Controlled Leg Movements",
                duration: 902,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Core Stability Drills",
                title: "Core Stability Drills",
                duration: 1060,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Flexibility & Stretching",
                title: "Flexibility & Stretching",
                duration: 796,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Cooldown & Recovery",
                title: "Cooldown & Recovery",
                duration: 491,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Beginner Practice Checklist",
                title: "Beginner Practice Checklist",
                duration: 230,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "amateur",
        title: "Amateur level",
        progress: 0,
        modules: [
          {
            id: "intermediate-core",
            completed: false,
            progress: 0,
            title: "Intermediate Core Strength",
            lessons: [
              {
                id: "Advanced Breathing Control",
                title: "Advanced Breathing Control",
                duration: 884,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Dynamic Core Exercises",
                title: "Dynamic Core Exercises",
                duration: 1355,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Building Endurance",
                title: "Building Endurance",
                duration: 1048,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Balance & Coordination",
                title: "Balance & Coordination",
                duration: 1153,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Resistance Band Training",
                title: "Resistance Band Training",
                duration: 1015,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Muscle Activation Techniques",
                title: "Muscle Activation Techniques",
                duration: 828,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Strength Progress Tracker",
                title: "Strength Progress Tracker",
                duration: 302,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "flexibility-mobility",
            completed: false,
            progress: 0,
            title: "Flexibility & Mobility",
            lessons: [
              {
                id: "Joint Mobility Basics",
                title: "Joint Mobility Basics",
                duration: 751,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Hip Flexibility Work",
                title: "Hip Flexibility Work",
                duration: 1105,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Shoulder Mobility Training",
                title: "Shoulder Mobility Training",
                duration: 859,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Hamstring Flexibility",
                title: "Hamstring Flexibility",
                duration: 948,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Foam Rolling Techniques",
                title: "Foam Rolling Techniques",
                duration: 713,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Recovery & Relaxation",
                title: "Recovery & Relaxation",
                duration: 607,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Mobility Routine Guide",
                title: "Mobility Routine Guide",
                duration: 284,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "intermediate-flow",
            completed: false,
            progress: 0,
            title: "Intermediate Pilates Flow",
            lessons: [
              {
                id: "Flow Sequence Basics",
                title: "Flow Sequence Basics",
                duration: 981,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Transitioning Between Exercises",
                title: "Transitioning Between Exercises",
                duration: 762,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Advanced Leg Work",
                title: "Advanced Leg Work",
                duration: 1096,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Upper Body Integration",
                title: "Upper Body Integration",
                duration: 1214,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Maintaining Rhythm & Tempo",
                title: "Maintaining Rhythm & Tempo",
                duration: 710,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Building Full-Body Coordination",
                title: "Building Full-Body Coordination",
                duration: 1029,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Intermediate Flow Notes",
                title: "Intermediate Flow Notes",
                duration: 316,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "professional",
        title: "Professional level",
        progress: 0,
        modules: [
          {
            id: "advanced-tech",
            completed: false,
            progress: 0,
            title: "Advanced Pilates Techniques",
            lessons: [
              {
                id: "Professional Warm-Up Systems",
                title: "Professional Warm-Up Systems",
                duration: 1122,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Advanced Core Sequences",
                title: "Advanced Core Sequences",
                duration: 1634,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "High-Level Flexibility Training",
                title: "High-Level Flexibility Training",
                duration: 1371,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Precision Movement Training",
                title: "Precision Movement Training",
                duration: 1158,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Injury Prevention Methods",
                title: "Injury Prevention Methods",
                duration: 967,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Professional Class Demonstration",
                title: "Professional Class Demonstration",
                duration: 1886,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Advanced Practice Workbook",
                title: "Advanced Practice Workbook",
                duration: 450,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
          {
            id: "coaching",
            completed: false,
            progress: 0,
            title: "Client Coaching & Instruction",
            lessons: [
              {
                id: "Understanding Client Needs",
                title: "Understanding Client Needs",
                duration: 944,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Building Training Programs",
                title: "Building Training Programs",
                duration: 1298,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Correcting Student Form",
                title: "Correcting Student Form",
                duration: 1040,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Motivational Coaching",
                title: "Motivational Coaching",
                duration: 794,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Teaching Group Classes",
                title: "Teaching Group Classes",
                duration: 1451,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Handling Injured Clients",
                title: "Handling Injured Clients",
                duration: 1172,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Instructor Evaluation Sheet",
                title: "Instructor Evaluation Sheet",
                duration: 308,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
          {
            id: "business",
            completed: false,
            progress: 0,
            title: "Business & Career Development",
            lessons: [
              {
                id: "Starting Your Pilates Career",
                title: "Starting Your Pilates Career",
                duration: 755,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Building a Personal Brand",
                title: "Building a Personal Brand",
                duration: 896,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Marketing Your Classes",
                title: "Marketing Your Classes",
                duration: 1137,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Social Media for Trainers",
                title: "Social Media for Trainers",
                duration: 700,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Managing Clients Professionally",
                title: "Managing Clients Professionally",
                duration: 1218,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Creating Long-Term Success",
                title: "Creating Long-Term Success",
                duration: 984,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Career Planning Workbook",
                title: "Career Planning Workbook",
                duration: 299,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
          {
            id: "mastery",
            completed: false,
            progress: 0,
            title: "Mastery & Final Assessment",
            lessons: [
              {
                id: "Preparing for Certification",
                title: "Preparing for Certification",
                duration: 928,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Mock Practical Assessment",
                title: "Mock Practical Assessment",
                duration: 1602,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Advanced Flow Demonstration",
                title: "Advanced Flow Demonstration",
                duration: 1377,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Professional Teaching Evaluation",
                title: "Professional Teaching Evaluation",
                duration: 1176,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Building Your Final Routine",
                title: "Building Your Final Routine",
                duration: 1070,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Final Course Wrap-Up",
                title: "Final Course Wrap-Up",
                duration: 615,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Final Certification Guide",
                title: "Final Certification Guide",
                duration: 371,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
              {
                id: "final-certification-exam",
                title: "Final Certification Exam",
                type: "exam",
                completed: false,

                exam: {
                  passingScore: 70,
                  maxAttempts: 3,
                  attempts: 0,
                  score: 0,
                  passed: false,

                  questions: [
                    {
                      id: "exam-1",
                      question: "Who created Pilates?",
                      answers: [
                        "Joseph Pilates",
                        "Bruce Lee",
                        "Arnold Schwarzenegger",
                        "Yoga Masters",
                      ],
                      correctAnswer: "Joseph Pilates",
                    },

                    {
                      id: "exam-2",
                      question: "The original name of Pilates was?",
                      answers: [
                        "Contrology",
                        "Body Training",
                        "Core System",
                        "Movement Flow",
                      ],
                      correctAnswer: "Contrology",
                    },

                    {
                      id: "exam-3",
                      question: "A major Pilates principle is?",
                      answers: ["Control", "Speed", "Competition", "Force"],
                      correctAnswer: "Control",
                    },

                    {
                      id: "exam-4",
                      question: "Neutral spine refers to?",
                      answers: [
                        "Natural spinal alignment",
                        "Flat back only",
                        "Rounded spine",
                        "Locked posture",
                      ],
                      correctAnswer: "Natural spinal alignment",
                    },

                    {
                      id: "exam-5",
                      question: "The Pilates powerhouse refers to?",
                      answers: ["Core muscles", "Arms", "Feet", "Neck"],
                      correctAnswer: "Core muscles",
                    },

                    {
                      id: "exam-6",
                      question: "Breathing during Pilates supports?",
                      answers: [
                        "Control and concentration",
                        "Speed",
                        "Maximum force",
                        "Fatigue",
                      ],
                      correctAnswer: "Control and concentration",
                    },

                    {
                      id: "exam-7",
                      question: "Good posture improves?",
                      answers: [
                        "Movement efficiency",
                        "Height",
                        "Body weight",
                        "Speed",
                      ],
                      correctAnswer: "Movement efficiency",
                    },

                    {
                      id: "exam-8",
                      question: "Warm-ups prepare the body by?",
                      answers: [
                        "Improving readiness for movement",
                        "Creating fatigue",
                        "Reducing mobility",
                        "Stopping exercise",
                      ],
                      correctAnswer: "Improving readiness for movement",
                    },

                    {
                      id: "exam-9",
                      question: "Pilates movements should be performed with?",
                      answers: [
                        "Precision and control",
                        "Maximum speed",
                        "Random effort",
                        "Heavy force",
                      ],
                      correctAnswer: "Precision and control",
                    },

                    {
                      id: "exam-10",
                      question: "Core stability helps with?",
                      answers: [
                        "Balance and control",
                        "Only arm strength",
                        "Only flexibility",
                        "Only endurance",
                      ],
                      correctAnswer: "Balance and control",
                    },

                    {
                      id: "exam-11",
                      question: "Mobility focuses on?",
                      answers: [
                        "Joint movement",
                        "Muscle size",
                        "Body weight",
                        "Speed",
                      ],
                      correctAnswer: "Joint movement",
                    },

                    {
                      id: "exam-12",
                      question: "Foam rolling supports?",
                      answers: [
                        "Recovery",
                        "Maximum strength",
                        "Competition",
                        "Speed",
                      ],
                      correctAnswer: "Recovery",
                    },

                    {
                      id: "exam-13",
                      question: "A Pilates sequence should be?",
                      answers: [
                        "Controlled and connected",
                        "Random",
                        "Chaotic",
                        "Unplanned",
                      ],
                      correctAnswer: "Controlled and connected",
                    },

                    {
                      id: "exam-14",
                      question: "Advanced movements require?",
                      answers: [
                        "Progression and control",
                        "Immediate difficulty",
                        "No instruction",
                        "Maximum force",
                      ],
                      correctAnswer: "Progression and control",
                    },

                    {
                      id: "exam-15",
                      question: "Injury prevention requires?",
                      answers: [
                        "Proper technique",
                        "More speed",
                        "Ignoring pain",
                        "Less awareness",
                      ],
                      correctAnswer: "Proper technique",
                    },

                    // {
                    //   id: "exam-16",
                    //   question: "A good instructor should?",
                    //   answers: [
                    //     "Adapt exercises to clients",
                    //     "Ignore needs",
                    //     "Use one method only",
                    //     "Avoid feedback",
                    //   ],
                    //   correctAnswer: "Adapt exercises to clients",
                    // },

                    // {
                    //   id: "exam-17",
                    //   question: "Client assessment helps create?",
                    //   answers: [
                    //     "Safe programs",
                    //     "Random workouts",
                    //     "Competition",
                    //     "Pressure",
                    //   ],
                    //   correctAnswer: "Safe programs",
                    // },

                    // {
                    //   id: "exam-18",
                    //   question: "Effective coaching requires?",
                    //   answers: [
                    //     "Clear communication",
                    //     "Silence",
                    //     "Confusion",
                    //     "No feedback",
                    //   ],
                    //   correctAnswer: "Clear communication",
                    // },

                    // {
                    //   id: "exam-19",
                    //   question: "A personal brand helps build?",
                    //   answers: [
                    //     "Trust and recognition",
                    //     "Confusion",
                    //     "Avoidance",
                    //     "Isolation",
                    //   ],
                    //   correctAnswer: "Trust and recognition",
                    // },

                    // {
                    //   id: "exam-20",
                    //   question: "Career growth requires?",
                    //   answers: [
                    //     "Continuous learning",
                    //     "Stopping education",
                    //     "Avoiding practice",
                    //     "Reducing skills",
                    //   ],
                    //   correctAnswer: "Continuous learning",
                    // },

                    // {
                    //   id: "exam-21",
                    //   question: "Professional instructors prioritize?",
                    //   answers: [
                    //     "Client safety",
                    //     "Competition",
                    //     "Speed",
                    //     "Difficulty",
                    //   ],
                    //   correctAnswer: "Client safety",
                    // },

                    // {
                    //   id: "exam-22",
                    //   question: "A successful Pilates class should provide?",
                    //   answers: [
                    //     "Value and guidance",
                    //     "Pressure",
                    //     "Confusion",
                    //     "Random exercises",
                    //   ],
                    //   correctAnswer: "Value and guidance",
                    // },

                    // {
                    //   id: "exam-23",
                    //   question: "Mastery comes from?",
                    //   answers: [
                    //     "Practice and understanding",
                    //     "Speed",
                    //     "Strength only",
                    //     "Flexibility only",
                    //   ],
                    //   correctAnswer: "Practice and understanding",
                    // },

                    // {
                    //   id: "exam-24",
                    //   question: "Certification demonstrates?",
                    //   answers: [
                    //     "Knowledge and competency",
                    //     "Only popularity",
                    //     "Only strength",
                    //     "Only experience",
                    //   ],
                    //   correctAnswer: "Knowledge and competency",
                    // },

                    // {
                    //   id: "exam-25",
                    //   question:
                    //     "A professional Pilates instructor should always maintain?",
                    //   answers: [
                    //     "Safety, control, and professionalism",
                    //     "Competition",
                    //     "Maximum intensity",
                    //     "Random methods",
                    //   ],
                    //   correctAnswer: "Safety, control, and professionalism",
                    // },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  // 2. Digital Photography Masterclass
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 3223,
    slug: "digital-photography-masterclass",
    instructor: "Amara Okonkwo",
    title: "Digital Photography Masterclass: From Auto to Manual",
    description:
      "Master your camera settings and shoot stunning photos in any lighting condition with this hands-on photography course for beginners and enthusiasts.",

    imgBig: "/assets/images/courses/photography-big.jpg",
    imgSmall: "/assets/images/courses/photography-small.jpg",

    price: 1850,
    originalPrice: 2800,
    pricePerModule: 61.67,
    currency: "₦",
    isEnrolled: true,

    rating: 4.5,
    reviewCount: 3872,

    tags: [
      "DSLR",
      "Lightroom",
      "Beginner",
      "Portrait",
      "Landscape",
      "Composition",
    ],
    extraTagsCount: 4,

    previewVideo: "/videos/photography-preview.mp4",
    totalRatings: 189,

    meta: {lessons: 22, difficulty: "Beginner"},

    stats: {
      students: 512,
      hoursOfVideo: 18,
      practiceTests: 3,
      additionalResources: 14,
      downloadableResources: 30,
    },

    features: {
      assignments: true,
      mobileAndTVAccess: true,
      fullLifetimeAccess: true,
      certificateOnCompletion: true,
    },

    enrolledStudents: 512,
    hours: 18,
    lastUpdated: "2026-04-28",
    certificate: "Digital Photography Masterclass Certificate of Completion",
    instructorBio:
      "Amara Okonkwo is a professional photographer and visual educator with a decade of experience shooting portraits, landscapes, and editorial work. She has taught photography workshops across Lagos and Accra, helping beginners move confidently from auto mode to full manual control.",
    instructorAvatar: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,
    instructorSocial: [
      {name: "Instagram", link: "https://instagram.com/amaraokonkwophoto"},
      {name: "YouTube", link: "https://youtube.com/@amaraokonkwophoto"},
      {name: "Website", link: "https://amaraokonkwo.com"},
    ],
    availableLanguage: ["English"],
    instructorRole: "Professional Photographer & Course Instructor",

    curriculum: [
      {
        id: "intro",
        title: "Introduction to Your Camera",
        isOpen: false,
        lessons: [],
      },
      {
        id: "exposure",
        title: "Understanding Exposure",
        isOpen: true,
        description: "The course description...",
        lessons: [],
      },
      {
        id: "composition",
        title: "Composition & Framing",
        isOpen: false,
        lessons: [],
      },
      {
        id: "lighting",
        title: "Natural & Artificial Lighting",
        isOpen: false,
        lessons: [],
      },
    ],

    curriculums: [
      {
        id: "foundation",
        title: "Foundation level",
        progress: 40,
        modules: [
          {
            id: "Your Camera & Gear",
            title: "Your Camera & Gear",
            completed: false,
            progress: 0,
            lessons: [
              {
                id: "Welcome & Course Overview",
                title: "Welcome & Course Overview",
                duration: 190,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Camera Types Explained (DSLR vs Mirrorless)",
                title: "Camera Types Explained (DSLR vs Mirrorless)",
                duration: 682,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Understanding Camera Buttons & Dials",
                title: "Understanding Camera Buttons & Dials",
                duration: 848,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Choosing the Right Lens",
                title: "Choosing the Right Lens",
                duration: 765,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Essential Accessories for Beginners",
                title: "Essential Accessories for Beginners",
                duration: 570,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Memory Cards, Storage & Backup",
                title: "Memory Cards, Storage & Backup",
                duration: 438,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Gear Checklist PDF",
                title: "Gear Checklist PDF",
                duration: 110,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "exposure-settings",
            completed: false,
            progress: 0,
            title: "Exposure & Camera Settings",
            lessons: [
              {
                id: "The Exposure Triangle Explained",
                title: "The Exposure Triangle Explained",
                duration: 1000,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Mastering Aperture (f-stops)",
                title: "Mastering Aperture (f-stops)",
                duration: 835,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Shutter Speed: Freezing & Motion Blur",
                title: "Shutter Speed: Freezing & Motion Blur",
                duration: 922,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "ISO & Noise Management",
                title: "ISO & Noise Management",
                duration: 677,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Shooting in Manual Mode",
                title: "Shooting in Manual Mode",
                duration: 1184,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "White Balance & Colour Temperature",
                title: "White Balance & Colour Temperature",
                duration: 636,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Exposure Practice Assignment",
                title: "Exposure Practice Assignment",
                duration: 240,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "shooting",
        title: "Shooting level",
        progress: 0,
        modules: [
          {
            id: "composition-framing",
            completed: false,
            progress: 0,
            title: "Composition & Framing",
            lessons: [
              {
                id: "Rule of Thirds in Practice",
                title: "Rule of Thirds in Practice",
                duration: 734,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Leading Lines & Visual Flow",
                title: "Leading Lines & Visual Flow",
                duration: 652,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Framing & Negative Space",
                title: "Framing & Negative Space",
                duration: 580,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Depth & Layers in a Shot",
                title: "Depth & Layers in a Shot",
                duration: 808,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Shooting Portraits That Pop",
                title: "Shooting Portraits That Pop",
                duration: 1085,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Landscape Photography Techniques",
                title: "Landscape Photography Techniques",
                duration: 1231,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Composition Reference Guide",
                title: "Composition Reference Guide",
                duration: 195,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "light-golden-hour",
            completed: false,
            progress: 0,
            title: "Light & the Golden Hour",
            lessons: [
              {
                id: "Natural Light: Direction & Quality",
                title: "Natural Light: Direction & Quality",
                duration: 860,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Shooting in Harsh Midday Sun",
                title: "Shooting in Harsh Midday Sun",
                duration: 708,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Golden Hour & Blue Hour",
                title: "Golden Hour & Blue Hour",
                duration: 1013,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Using Reflectors & Diffusers",
                title: "Using Reflectors & Diffusers",
                duration: 792,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Intro to Flash Photography",
                title: "Intro to Flash Photography",
                duration: 1056,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Indoor Photography in Low Light",
                title: "Indoor Photography in Low Light",
                duration: 904,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Lighting Setup Cheatsheet",
                title: "Lighting Setup Cheatsheet",
                duration: 165,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "post-processing",
        title: "Post-processing level",
        progress: 0,
        modules: [
          {
            id: "editing-lightroom",
            completed: false,
            progress: 0,
            title: "Editing in Lightroom",
            lessons: [
              {
                id: "Lightroom Interface Tour",
                title: "Lightroom Interface Tour",
                duration: 610,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Importing & Organising Your Photos",
                title: "Importing & Organising Your Photos",
                duration: 535,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Basic Tone & Colour Adjustments",
                title: "Basic Tone & Colour Adjustments",
                duration: 1042,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Cropping, Straightening & Healing",
                title: "Cropping, Straightening & Healing",
                duration: 728,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Working with Presets",
                title: "Working with Presets",
                duration: 884,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Exporting for Print & Social Media",
                title: "Exporting for Print & Social Media",
                duration: 559,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Lightroom Editing Workflow PDF",
                title: "Lightroom Editing Workflow PDF",
                duration: 220,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. UI/UX Design Bootcamp
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 12323,
    slug: "ui-ux-design-bootcamp",
    instructor: "Chidi Mensah",
    title: "UI/UX Design Bootcamp: Design Products People Love",
    description:
      "Learn the complete product design process from user research and wireframing to high-fidelity prototypes in Figma, with real-world project briefs.",

    imgBig: "/assets/images/courses/uiux-big.jpg",
    imgSmall: "/assets/images/courses/uiux-small.jpg",

    price: 3100,
    originalPrice: 4500,
    pricePerModule: 86.11,
    currency: "₦",
    isEnrolled: false,

    rating: 4.9,
    reviewCount: 7184,

    tags: [
      "Figma",
      "Wireframing",
      "Prototyping",
      "User Research",
      "Design Systems",
      "Accessibility",
    ],
    extraTagsCount: 6,

    previewVideo: "/videos/uiux-preview.mp4",
    totalRatings: 412,

    meta: {lessons: 34, difficulty: "Moderate"},

    stats: {
      students: 874,
      hoursOfVideo: 28,
      practiceTests: 5,
      additionalResources: 20,
      downloadableResources: 42,
    },

    features: {
      assignments: true,
      mobileAndTVAccess: true,
      fullLifetimeAccess: true,
      certificateOnCompletion: true,
    },

    curriculum: [
      {
        id: "intro",
        title: "Introduction to UX Thinking",
        isOpen: false,
        lessons: [],
      },
      {
        id: "research",
        title: "User Research & Personas",
        isOpen: true,
        description: "The course description...",
        lessons: [],
      },
      {
        id: "wireframes",
        title: "Wireframing & Low-Fi Prototypes",
        isOpen: false,
        lessons: [],
      },
      {
        id: "figma",
        title: "High-Fidelity Design in Figma",
        isOpen: false,
        lessons: [],
      },
      {
        id: "handoff",
        title: "Design Handoff & Developer Collaboration",
        isOpen: false,
        lessons: [],
      },
    ],

    curriculums: [
      {
        id: "foundation",
        title: "Foundation level",
        progress: 0,
        modules: [
          {
            id: "ux-thinking",
            completed: false,
            progress: 0,
            title: "UX Thinking & Research",
            lessons: [
              {
                id: "Welcome & Course Roadmap",
                title: "Welcome & Course Roadmap",
                duration: 255,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "What is UX? Principles & Goals",
                title: "What is UX? Principles & Goals",
                duration: 820,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Understanding Your Users",
                title: "Understanding Your Users",
                duration: 988,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Conducting User Interviews",
                title: "Conducting User Interviews",
                duration: 1274,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Creating User Personas",
                title: "Creating User Personas",
                duration: 1115,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Defining the Problem Statement",
                title: "Defining the Problem Statement",
                duration: 772,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "User Research Template",
                title: "User Research Template",
                duration: 210,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "wireframing-ia",
            completed: false,
            progress: 0,
            title: "Wireframing & Information Architecture",
            lessons: [
              {
                id: "What is Information Architecture?",
                title: "What is Information Architecture?",
                duration: 644,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Sketching Your First Wireframes",
                title: "Sketching Your First Wireframes",
                duration: 862,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Building Low-Fidelity Wireframes in Figma",
                title: "Building Low-Fidelity Wireframes in Figma",
                duration: 1328,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "User Flows & Navigation Maps",
                title: "User Flows & Navigation Maps",
                duration: 1076,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Card Sorting & Site Maps",
                title: "Card Sorting & Site Maps",
                duration: 798,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Gathering Wireframe Feedback",
                title: "Gathering Wireframe Feedback",
                duration: 665,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Wireframe Review Checklist",
                title: "Wireframe Review Checklist",
                duration: 170,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "design",
        title: "Design level",
        progress: 0,
        modules: [
          {
            id: "high-fi-figma",
            completed: false,
            progress: 0,
            title: "High-Fidelity Design in Figma",
            lessons: [
              {
                id: "Figma Interface & Shortcuts",
                title: "Figma Interface & Shortcuts",
                duration: 750,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Typography in UI Design",
                title: "Typography in UI Design",
                duration: 944,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Colour Systems & Accessibility",
                title: "Colour Systems & Accessibility",
                duration: 1082,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Designing Components & Variants",
                title: "Designing Components & Variants",
                duration: 1457,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Auto Layout & Responsive Frames",
                title: "Auto Layout & Responsive Frames",
                duration: 1233,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Building a Design System from Scratch",
                title: "Building a Design System from Scratch",
                duration: 1721,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Design System Starter File",
                title: "Design System Starter File",
                duration: 300,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "prototyping-testing",
            completed: false,
            progress: 0,
            title: "Prototyping & Usability Testing",
            lessons: [
              {
                id: "Interactive Prototypes in Figma",
                title: "Interactive Prototypes in Figma",
                duration: 978,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Micro-interactions & Transitions",
                title: "Micro-interactions & Transitions",
                duration: 896,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Planning a Usability Test",
                title: "Planning a Usability Test",
                duration: 820,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Running Moderated Testing Sessions",
                title: "Running Moderated Testing Sessions",
                duration: 1162,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Analysing Test Results & Iterating",
                title: "Analysing Test Results & Iterating",
                duration: 1028,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "A/B Testing Fundamentals",
                title: "A/B Testing Fundamentals",
                duration: 715,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Usability Test Script Template",
                title: "Usability Test Script Template",
                duration: 190,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "professional",
        title: "Professional level",
        progress: 0,
        modules: [
          {
            id: "accessibility",
            completed: false,
            progress: 0,
            title: "Accessibility & Inclusive Design",
            lessons: [
              {
                id: "Why Accessibility Matters",
                title: "Why Accessibility Matters",
                duration: 614,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "WCAG Guidelines in Practice",
                title: "WCAG Guidelines in Practice",
                duration: 997,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Colour Contrast & Text Legibility",
                title: "Colour Contrast & Text Legibility",
                duration: 768,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Designing for Screen Readers",
                title: "Designing for Screen Readers",
                duration: 920,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Inclusive Motion & Animations",
                title: "Inclusive Motion & Animations",
                duration: 693,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Accessibility Audit Checklist",
                title: "Accessibility Audit Checklist",
                duration: 225,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "handoff-collaboration",
            completed: false,
            progress: 0,
            title: "Design Handoff & Collaboration",
            lessons: [
              {
                id: "Preparing Files for Developers",
                title: "Preparing Files for Developers",
                duration: 852,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Writing Design Specs & Annotations",
                title: "Writing Design Specs & Annotations",
                duration: 778,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Using Dev Mode in Figma",
                title: "Using Dev Mode in Figma",
                duration: 1004,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Version Control & Design Reviews",
                title: "Version Control & Design Reviews",
                duration: 802,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Presenting Your Work to Stakeholders",
                title: "Presenting Your Work to Stakeholders",
                duration: 1086,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Building Your UX Portfolio",
                title: "Building Your UX Portfolio",
                duration: 1350,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Portfolio Case Study Template",
                title: "Portfolio Case Study Template",
                duration: 260,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
    ],

    instructorRole: "Senior Product Designer at Flutterwave",

    instructorBio:
      "Chidi Mensah is a Senior Product Designer with over 9 years of experience designing fintech, e-commerce, and SaaS products across Africa. He has helped startups scale design systems and improve user experiences used by millions of customers.",

    instructorAvatar: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,

    instructorSocial: [
      {
        name: "LinkedIn",
        link: "https://linkedin.com/in/chidimensah",
      },
      {
        name: "X",
        link: "https://x.com/chidimensah",
      },
      {
        name: "Portfolio",
        link: "https://chididesigns.com",
      },
    ],

    enrolledStudents: 18742,
    hours: 28,
    lastUpdated: "May 2026",

    certificate: "Professional Certificate in UI/UX Design & Product Thinking",

    availableLanguage: ["English", "French", "Spanish"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Python for Data Science
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 32043,
    slug: "python-for-data-science",
    instructor: "Fatima Al-Hassan",
    title: "Python for Data Science & Machine Learning Bootcamp",
    description:
      "Go from Python basics to building real machine learning models. Covers NumPy, Pandas, Matplotlib, Scikit-Learn, and hands-on projects with real datasets.",

    imgBig: "/assets/images/courses/python-big.jpg",
    imgSmall: "/assets/images/courses/python-small.jpg",

    price: 2700,
    originalPrice: 4000,
    pricePerModule: 90.0,
    currency: "₦",
    isEnrolled: false,

    rating: 4.8,
    reviewCount: 9423,

    tags: [
      "Python",
      "Pandas",
      "Machine Learning",
      "Scikit-Learn",
      "Jupyter",
      "Data Analysis",
    ],
    extraTagsCount: 7,

    previewVideo: "/videos/python-preview.mp4",
    totalRatings: 631,

    meta: {lessons: 41, difficulty: "Moderate"},

    stats: {
      students: 1240,
      hoursOfVideo: 35,
      practiceTests: 8,
      additionalResources: 18,
      downloadableResources: 55,
    },

    features: {
      assignments: true,
      mobileAndTVAccess: true,
      fullLifetimeAccess: true,
      certificateOnCompletion: true,
    },

    curriculum: [
      {id: "intro", title: "Python Crash Course", isOpen: false, lessons: []},
      {
        id: "numpy",
        title: "NumPy & Pandas Fundamentals",
        isOpen: true,
        description: "The course description...",
        lessons: [],
      },
      {
        id: "viz",
        title: "Data Visualisation with Matplotlib & Seaborn",
        isOpen: false,
        lessons: [],
      },
      {
        id: "ml",
        title: "Introduction to Machine Learning",
        isOpen: false,
        lessons: [],
      },
      {id: "projects", title: "Capstone Projects", isOpen: false, lessons: []},
    ],

    curriculums: [
      {
        id: "fundamentals",
        title: "Python Fundamentals",
        progress: 0,
        modules: [
          {
            id: "python-crash-course",
            completed: false,
            progress: 0,
            title: "Python Crash Course",
            lessons: [
              {
                id: "Setting Up Python & Jupyter Notebook",
                title: "Setting Up Python & Jupyter Notebook",
                duration: 522,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Variables, Data Types & Operators",
                title: "Variables, Data Types & Operators",
                duration: 918,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Lists, Tuples & Dictionaries",
                title: "Lists, Tuples & Dictionaries",
                duration: 1180,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Control Flow: If, Loops & Functions",
                title: "Control Flow: If, Loops & Functions",
                duration: 1334,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Writing Clean Python Code",
                title: "Writing Clean Python Code",
                duration: 775,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Intro to OOP in Python",
                title: "Intro to OOP in Python",
                duration: 1110,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Python Cheat Sheet",
                title: "Python Cheat Sheet",
                duration: 120,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "numpy-pandas",
            completed: false,
            progress: 0,
            title: "NumPy & Pandas Fundamentals",
            lessons: [
              {
                id: "What is NumPy? Arrays & Operations",
                title: "What is NumPy? Arrays & Operations",
                duration: 1004,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Indexing, Slicing & Reshaping Arrays",
                title: "Indexing, Slicing & Reshaping Arrays",
                duration: 868,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Intro to Pandas DataFrames",
                title: "Intro to Pandas DataFrames",
                duration: 1132,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Cleaning & Handling Missing Data",
                title: "Cleaning & Handling Missing Data",
                duration: 1277,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Grouping, Merging & Pivoting Data",
                title: "Grouping, Merging & Pivoting Data",
                duration: 1386,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Reading CSV, JSON & Excel Files",
                title: "Reading CSV, JSON & Excel Files",
                duration: 644,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Pandas Reference Notebook",
                title: "Pandas Reference Notebook",
                duration: 200,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "analysis-viz",
        title: "Data Analysis & Visualisation",
        progress: 0,
        modules: [
          {
            id: "viz-matplotlib-seaborn",
            completed: false,
            progress: 0,
            title: "Visualisation with Matplotlib & Seaborn",
            lessons: [
              {
                id: "Matplotlib Basics: Plots & Subplots",
                title: "Matplotlib Basics: Plots & Subplots",
                duration: 933,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Customising Charts: Labels, Colours & Styles",
                title: "Customising Charts: Labels, Colours & Styles",
                duration: 800,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Seaborn for Statistical Visualisation",
                title: "Seaborn for Statistical Visualisation",
                duration: 1068,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Heatmaps, Pair Plots & Distributions",
                title: "Heatmaps, Pair Plots & Distributions",
                duration: 1154,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Interactive Charts with Plotly",
                title: "Interactive Charts with Plotly",
                duration: 965,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Telling Stories with Data",
                title: "Telling Stories with Data",
                duration: 882,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Visualisation Style Guide",
                title: "Visualisation Style Guide",
                duration: 175,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "eda-process",
            completed: false,
            progress: 0,
            title: "Exploratory Data Analysis (EDA)",
            lessons: [
              {
                id: "The EDA Process End-to-End",
                title: "The EDA Process End-to-End",
                duration: 1218,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Descriptive Statistics in Pandas",
                title: "Descriptive Statistics in Pandas",
                duration: 876,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Correlation & Feature Relationships",
                title: "Correlation & Feature Relationships",
                duration: 1012,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Detecting & Handling Outliers",
                title: "Detecting & Handling Outliers",
                duration: 928,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Feature Engineering Basics",
                title: "Feature Engineering Basics",
                duration: 1120,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "EDA Project: Real Dataset Walkthrough",
                title: "EDA Project: Real Dataset Walkthrough",
                duration: 1875,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "EDA Checklist & Notes",
                title: "EDA Checklist & Notes",
                duration: 250,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "machine-learning",
        title: "Machine Learning",
        progress: 0,
        modules: [
          {
            id: "ml-scikit-learn",
            completed: false,
            progress: 0,
            title: "Intro to Machine Learning with Scikit-Learn",
            lessons: [
              {
                id: "ML Concepts: Supervised vs Unsupervised",
                title: "ML Concepts: Supervised vs Unsupervised",
                duration: 764,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Train/Test Split & Cross-Validation",
                title: "Train/Test Split & Cross-Validation",
                duration: 922,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Linear & Logistic Regression",
                title: "Linear & Logistic Regression",
                duration: 1330,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Decision Trees & Random Forests",
                title: "Decision Trees & Random Forests",
                duration: 1475,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Model Evaluation: Accuracy, Precision & Recall",
                title: "Model Evaluation: Accuracy, Precision & Recall",
                duration: 1088,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Hyperparameter Tuning with GridSearchCV",
                title: "Hyperparameter Tuning with GridSearchCV",
                duration: 1195,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "ML Model Comparison Sheet",
                title: "ML Model Comparison Sheet",
                duration: 210,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "capstone-projects",
            completed: false,
            progress: 0,
            title: "Capstone Projects",
            lessons: [
              {
                id: "Project 1: Sales Forecasting",
                title: "Project 1: Sales Forecasting",
                duration: 2118,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Project 2: Customer Churn Prediction",
                title: "Project 2: Customer Churn Prediction",
                duration: 2422,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Project 3: Housing Price Regression",
                title: "Project 3: Housing Price Regression",
                duration: 2324,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Presenting Your ML Project",
                title: "Presenting Your ML Project",
                duration: 990,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Capstone Project Submission Guide",
                title: "Capstone Project Submission Guide",
                duration: 315,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
    ],

    instructorRole: "Lead Data Scientist",

    instructorBio:
      "Fatima Al-Hassan is a machine learning engineer and data scientist with extensive experience building predictive models, recommendation systems, and AI-powered analytics products. She has trained thousands of students worldwide in practical data science.",

    instructorAvatar: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,

    instructorSocial: [
      {
        name: "LinkedIn",
        link: "https://linkedin.com/in/fatimaalhassan",
      },
      {
        name: "GitHub",
        link: "https://github.com/fatimaalhassan",
      },
      {
        name: "Kaggle",
        link: "https://kaggle.com/fatimaalhassan",
      },
    ],

    enrolledStudents: 24316,
    hours: 35,
    lastUpdated: "April 2026",

    certificate: "Professional Certificate in Data Science & Machine Learning",

    availableLanguage: ["English", "Arabic", "French"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Guitar for Beginners
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 323009,
    slug: "guitar-for-beginners",
    instructor: "Seun Adeyemi",
    title: "Guitar for Beginners: Learn Acoustic Guitar from Scratch",
    description:
      "Pick up the guitar and start playing songs you love within weeks. This beginner-friendly course covers chords, strumming patterns, music theory basics, and 10 popular songs.",

    imgBig: "/assets/images/courses/guitar-big.jpg",
    imgSmall: "/assets/images/courses/guitar-small.jpg",

    price: 1200,
    originalPrice: 1900,
    pricePerModule: 48.0,
    currency: "₦",
    isEnrolled: true,

    rating: 4.6,
    reviewCount: 2356,

    tags: [
      "Acoustic Guitar",
      "Music Theory",
      "Beginner",
      "Chords",
      "Strumming",
    ],
    extraTagsCount: 3,

    previewVideo: "/videos/guitar-preview.mp4",
    totalRatings: 147,

    meta: {lessons: 25, difficulty: "Beginner"},

    stats: {
      students: 298,
      hoursOfVideo: 12,
      practiceTests: 1,
      additionalResources: 8,
      downloadableResources: 15,
    },

    features: {
      assignments: false,
      mobileAndTVAccess: true,
      fullLifetimeAccess: true,
      certificateOnCompletion: false,
    },

    curriculum: [
      {
        id: "intro",
        title: "Getting Started & Guitar Anatomy",
        isOpen: false,
        lessons: [],
      },
      {
        id: "chords",
        title: "Essential Open Chords",
        isOpen: true,
        description: "The course description...",
        lessons: [],
      },
      {
        id: "strumming",
        title: "Strumming Patterns & Rhythm",
        isOpen: false,
        lessons: [],
      },
      {
        id: "songs",
        title: "Playing Your First 10 Songs",
        isOpen: false,
        lessons: [],
      },
    ],

    curriculums: [
      {
        id: "starter",
        title: "Starter level",
        progress: 65,
        modules: [
          {
            id: "getting-started",
            completed: false,
            progress: 0,
            title: "Getting Started with Guitar",
            lessons: [
              {
                id: "Welcome & What You'll Need",
                title: "Welcome & What You'll Need",
                duration: 224,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Guitar Anatomy: Parts & Their Purpose",
                title: "Guitar Anatomy: Parts & Their Purpose",
                duration: 498,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "How to Hold Your Guitar & Pick",
                title: "How to Hold Your Guitar & Pick",
                duration: 415,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Tuning Your Guitar (by Ear & App)",
                title: "Tuning Your Guitar (by Ear & App)",
                duration: 450,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Reading Chord Diagrams & Tabs",
                title: "Reading Chord Diagrams & Tabs",
                duration: 614,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Finger Exercises for Beginners",
                title: "Finger Exercises for Beginners",
                duration: 542,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Beginner Guitar Setup Guide",
                title: "Beginner Guitar Setup Guide",
                duration: 130,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "open-chords",
            completed: false,
            progress: 0,
            title: "Essential Open Chords",
            lessons: [
              {
                id: "Your First 3 Chords: G, C, D",
                title: "Your First 3 Chords: G, C, D",
                duration: 876,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Em, Am & E Minor Shapes",
                title: "Em, Am & E Minor Shapes",
                duration: 768,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Clean Chord Transitions",
                title: "Clean Chord Transitions",
                duration: 682,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "F Chord: The Beginner's Challenge",
                title: "F Chord: The Beginner's Challenge",
                duration: 910,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Common Chord Progressions",
                title: "Common Chord Progressions",
                duration: 824,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Chord Chart PDF",
                title: "Chord Chart PDF",
                duration: 90,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
      {
        id: "player",
        title: "Player level",
        progress: 0,
        modules: [
          {
            id: "strumming-rhythm",
            completed: false,
            progress: 0,
            title: "Strumming Patterns & Rhythm",
            lessons: [
              {
                id: "Down Strums & Basic Rhythm",
                title: "Down Strums & Basic Rhythm",
                duration: 590,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Down-Up Strumming Patterns",
                title: "Down-Up Strumming Patterns",
                duration: 695,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "The 8th-Note Strum Pattern",
                title: "The 8th-Note Strum Pattern",
                duration: 798,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Adding Muting & Accents",
                title: "Adding Muting & Accents",
                duration: 884,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Fingerpicking Basics",
                title: "Fingerpicking Basics",
                duration: 1022,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Strumming Practice Loop Files",
                title: "Strumming Practice Loop Files",
                duration: 150,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
          {
            id: "first-10-songs",
            completed: false,
            progress: 0,
            title: "Playing Your First 10 Songs",
            lessons: [
              {
                id: "Song 1: Knockin' on Heaven's Door",
                title: "Song 1: Knockin' on Heaven's Door",
                duration: 1120,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Song 2: Wonderwall",
                title: "Song 2: Wonderwall",
                duration: 1275,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Song 3: Let Her Go",
                title: "Song 3: Let Her Go",
                duration: 1192,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Song 4: Horse With No Name",
                title: "Song 4: Horse With No Name",
                duration: 1050,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Song 5: Brown Eyed Girl",
                title: "Song 5: Brown Eyed Girl",
                duration: 1328,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Songs 6–10: Guided Walkthrough",
                title: "Songs 6–10: Guided Walkthrough",
                duration: 2902,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 127,
              },
              {
                id: "Song Tabs & Chord Sheets",
                title: "Song Tabs & Chord Sheets",
                duration: 180,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 127,
              },
            ],
          },
        ],
      },
    ],

    instructorRole: "Professional Guitar Instructor & Performer",

    instructorBio:
      "Seun Adeyemi is a professional guitarist and music educator who has spent over a decade teaching beginners how to confidently play acoustic guitar. His practical teaching style focuses on helping students play real songs quickly.",

    instructorAvatar: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,

    instructorSocial: [
      {
        name: "YouTube",
        link: "https://youtube.com/@seunadeyemi",
      },
      {
        name: "Instagram",
        link: "https://instagram.com/seunadeyemi",
      },
      {
        name: "Website",
        link: "https://seunmusic.com",
      },
    ],

    enrolledStudents: 6845,
    hours: 12,
    lastUpdated: "March 2026",

    certificate: "Certificate of Completion in Acoustic Guitar Fundamentals",

    availableLanguage: ["English"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Advanced Web Development
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 652323,
    slug: "advanced-web-development",
    instructor: "Tobenna Eze",
    title: "Advanced Web Development: Next.js, TypeScript & System Design",
    description:
      "Level up from junior to senior developer. Deep-dives into Next.js App Router, TypeScript patterns, performance optimisation, testing, and scalable architecture.",

    imgBig: "/assets/images/courses/webdev-big.jpg",
    imgSmall: "/assets/images/courses/webdev-small.jpg",

    price: 3800,
    originalPrice: 5500,
    pricePerModule: 105.56,
    currency: "₦",
    isEnrolled: false,

    rating: 4.9,
    reviewCount: 4678,

    tags: [
      "Next.js",
      "TypeScript",
      "System Design",
      "Testing",
      "Performance",
      "React",
    ],
    extraTagsCount: 5,

    previewVideo: "/videos/webdev-preview.mp4",
    totalRatings: 308,

    meta: {lessons: 52, difficulty: "Advanced"},

    stats: {
      students: 690,
      hoursOfVideo: 44,
      practiceTests: 10,
      additionalResources: 25,
      downloadableResources: 60,
    },

    features: {
      assignments: true,
      mobileAndTVAccess: true,
      fullLifetimeAccess: true,
      certificateOnCompletion: true,
    },

    curriculum: [
      {id: "intro", title: "TypeScript Deep Dive", isOpen: false, lessons: []},
      {
        id: "nextjs",
        title: "Next.js App Router & Server Components",
        isOpen: true,
        description: "The course description...",
        lessons: [],
      },
      {
        id: "perf",
        title: "Performance & Core Web Vitals",
        isOpen: false,
        lessons: [],
      },
      {
        id: "testing",
        title: "Testing with Vitest & Playwright",
        isOpen: false,
        lessons: [],
      },
      {
        id: "system",
        title: "System Design for Frontend Engineers",
        isOpen: false,
        lessons: [],
      },
      {
        id: "deploy",
        title: "CI/CD, Monitoring & Deployment",
        isOpen: false,
        lessons: [],
      },
    ],

    curriculums: [
      {
        id: "intermediate",
        title: "Intermediate level",
        progress: 0,
        modules: [
          {
            id: "typescript-deep-dive",
            completed: false,
            progress: 0,
            title: "TypeScript Deep Dive",
            lessons: [
              {
                id: "Advanced Types: Union, Intersection & Generics",
                title: "Advanced Types: Union, Intersection & Generics",
                duration: 1458,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Utility Types: Partial, Pick, Omit & More",
                title: "Utility Types: Partial, Pick, Omit & More",
                duration: 1124,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Type Guards & Narrowing",
                title: "Type Guards & Narrowing",
                duration: 990,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "TypeScript with React: Props & State Patterns",
                title: "TypeScript with React: Props & State Patterns",
                duration: 1312,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Strict Mode & Eliminating `any`",
                title: "Strict Mode & Eliminating `any`",
                duration: 848,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Declaration Files & Third-Party Types",
                title: "Declaration Files & Third-Party Types",
                duration: 756,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "TypeScript Pattern Reference Guide",
                title: "TypeScript Pattern Reference Guide",
                duration: 240,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
          {
            id: "nextjs-app-router",
            completed: false,
            progress: 0,
            title: "Next.js App Router & Server Components",
            lessons: [
              {
                id: "App Router Architecture Overview",
                title: "App Router Architecture Overview",
                duration: 1214,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Server Components vs Client Components",
                title: "Server Components vs Client Components",
                duration: 1360,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Data Fetching: fetch, cache & revalidate",
                title: "Data Fetching: fetch, cache & revalidate",
                duration: 1518,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Loading UI & Suspense Boundaries",
                title: "Loading UI & Suspense Boundaries",
                duration: 1075,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Error Boundaries & Not Found Pages",
                title: "Error Boundaries & Not Found Pages",
                duration: 862,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Route Handlers & Middleware",
                title: "Route Handlers & Middleware",
                duration: 1188,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Parallel & Intercepting Routes",
                title: "Parallel & Intercepting Routes",
                duration: 1090,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Next.js App Router Cheatsheet",
                title: "Next.js App Router Cheatsheet",
                duration: 230,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
        ],
      },
      {
        id: "advanced",
        title: "Advanced level",
        progress: 0,
        modules: [
          {
            id: "performance-web-vitals",
            completed: false,
            progress: 0,
            title: "Performance & Core Web Vitals",
            lessons: [
              {
                id: "Understanding LCP, FID/INP & CLS",
                title: "Understanding LCP, FID/INP & CLS",
                duration: 944,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Image Optimisation with next/image",
                title: "Image Optimisation with next/image",
                duration: 808,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Font Loading & Layout Shift Prevention",
                title: "Font Loading & Layout Shift Prevention",
                duration: 712,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Bundle Analysis & Code Splitting",
                title: "Bundle Analysis & Code Splitting",
                duration: 1116,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "React Performance: Memo, useCallback & Profiler",
                title: "React Performance: Memo, useCallback & Profiler",
                duration: 1334,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Caching Strategies: Stale-While-Revalidate",
                title: "Caching Strategies: Stale-While-Revalidate",
                duration: 1000,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Performance Audit Checklist",
                title: "Performance Audit Checklist",
                duration: 195,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
          {
            id: "testing-vitest-playwright",
            completed: false,
            progress: 0,
            title: "Testing with Vitest & Playwright",
            lessons: [
              {
                id: "Testing Philosophy: Unit, Integration & E2E",
                title: "Testing Philosophy: Unit, Integration & E2E",
                duration: 728,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Setting Up Vitest in a Next.js Project",
                title: "Setting Up Vitest in a Next.js Project",
                duration: 655,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Writing Unit Tests for Utilities & Hooks",
                title: "Writing Unit Tests for Utilities & Hooks",
                duration: 1170,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Component Testing with React Testing Library",
                title: "Component Testing with React Testing Library",
                duration: 1394,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Mocking APIs & Modules",
                title: "Mocking APIs & Modules",
                duration: 1068,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "E2E Testing with Playwright",
                title: "E2E Testing with Playwright",
                duration: 1702,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Test Coverage Reports & CI Integration",
                title: "Test Coverage Reports & CI Integration",
                duration: 906,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Testing Strategy Reference Doc",
                title: "Testing Strategy Reference Doc",
                duration: 270,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
        ],
      },
      {
        id: "expert",
        title: "Senior / Expert level",
        progress: 0,
        modules: [
          {
            id: "system-design",
            completed: false,
            progress: 0,
            title: "System Design for Frontend Engineers",
            lessons: [
              {
                id: "Thinking in Systems: Scale & Trade-offs",
                title: "Thinking in Systems: Scale & Trade-offs",
                duration: 1102,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Monorepo Architecture with Turborepo",
                title: "Monorepo Architecture with Turborepo",
                duration: 1450,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Micro-frontends: When & How",
                title: "Micro-frontends: When & How",
                duration: 1248,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "API Design: REST, GraphQL & tRPC",
                title: "API Design: REST, GraphQL & tRPC",
                duration: 1356,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "State Management at Scale",
                title: "State Management at Scale",
                duration: 1154,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Designing Component Libraries",
                title: "Designing Component Libraries",
                duration: 1060,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "System Design Interview Notes",
                title: "System Design Interview Notes",
                duration: 300,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
          {
            id: "cicd-deployment",
            completed: false,
            progress: 0,
            title: "CI/CD, Monitoring & Deployment",
            lessons: [
              {
                id: "GitHub Actions for Frontend Projects",
                title: "GitHub Actions for Frontend Projects",
                duration: 988,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Automated Linting, Formatting & Type Checks",
                title: "Automated Linting, Formatting & Type Checks",
                duration: 734,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Deploying to Vercel: Environments & Previews",
                title: "Deploying to Vercel: Environments & Previews",
                duration: 892,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Feature Flags & Incremental Rollouts",
                title: "Feature Flags & Incremental Rollouts",
                duration: 1050,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Error Monitoring with Sentry",
                title: "Error Monitoring with Sentry",
                duration: 824,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Analytics, Logging & Observability",
                title: "Analytics, Logging & Observability",
                duration: 918,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Final Capstone: Full-Stack Production App",
                title: "Final Capstone: Full-Stack Production App",
                duration: 3120,
                src: getRandomSrc(),
                type: "video",
                completed: false,
                currentTime: 0,
              },
              {
                id: "Deployment & DevOps Runbook",
                title: "Deployment & DevOps Runbook",
                duration: 330,
                src: getRandomSrc(),
                type: "doc",
                completed: false,
                currentTime: 0,
              },
            ],
          },
        ],
      },
    ],

    instructorRole: "Senior Frontend Architect",

    instructorBio:
      "Tobenna Eze is a software architect and frontend engineering mentor with over 10 years of experience building large-scale web applications using React, Next.js, TypeScript, cloud infrastructure, and modern frontend architecture patterns.",

    instructorAvatar: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,

    instructorSocial: [
      {
        name: "LinkedIn",
        link: "https://linkedin.com/in/tobennaeze",
      },
      {
        name: "GitHub",
        link: "https://github.com/tobennaeze",
      },
      {
        name: "Website",
        link: "https://tobenna.dev",
      },
    ],

    enrolledStudents: 12563,
    hours: 44,
    lastUpdated: "June 2026",

    certificate: "",

    availableLanguage: ["English"],
  },
];
