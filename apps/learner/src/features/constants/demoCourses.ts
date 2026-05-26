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
  reviewCount: string;

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

  curriculum: CurriculumSection[];

  modules: CourseModuleLevel[];
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

export type LessonType = "video" | "doc";

export interface Lessons {
  title: string;
  duration: string;
  src: string;
  type: LessonType;
}

export interface CourseModule {
  title: string;
  lessons: Lessons[];
}

export interface CourseModuleLevel {
  title: string;
  progress?: number;
  status?: "not started" | "in progress" | "completed";
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
    reviewCount: "5.2k",

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

    modules: [
      {
        title: "Beginner level",
        progress: 12,
        modules: [
          {
            title: "Introduction to Pilates",
            lessons: [
              {
                title: "Welcome to the Course",
                duration: "2:02",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Course Aims & Objectives",
                duration: "3:02",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "History of Pilates",
                duration: "12:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Understanding Core Principles",
                duration: "18:45",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Teaching Rules & Regulations",
                duration: "32:25",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Certification Information",
                duration: "2:56",
                src: getRandomSrc(),
                type: "doc",
              },
              {
                title: "Student Guide to MCC",
                duration: "0:49",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Body Awareness & Posture",
            lessons: [
              {
                title: "Introduction to Alignment",
                duration: "10:45",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Neutral Spine Explained",
                duration: "14:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Understanding Pelvic Position",
                duration: "9:54",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Breathing Fundamentals",
                duration: "11:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Improving Posture Daily",
                duration: "16:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Common Beginner Mistakes",
                duration: "8:42",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Posture Assessment Worksheet",
                duration: "4:15",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Beginner Movement Training",
            lessons: [
              {
                title: "Warm-Up Techniques",
                duration: "7:35",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Basic Mat Exercises",
                duration: "21:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Controlled Leg Movements",
                duration: "15:02",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Core Stability Drills",
                duration: "17:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Flexibility & Stretching",
                duration: "13:16",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Cooldown & Recovery",
                duration: "8:11",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Beginner Practice Checklist",
                duration: "3:50",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Amateur level",
        progress: 0,
        modules: [
          {
            title: "Intermediate Core Strength",
            lessons: [
              {
                title: "Advanced Breathing Control",
                duration: "14:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Dynamic Core Exercises",
                duration: "22:35",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Building Endurance",
                duration: "17:28",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Balance & Coordination",
                duration: "19:13",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Resistance Band Training",
                duration: "16:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Muscle Activation Techniques",
                duration: "13:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Strength Progress Tracker",
                duration: "5:02",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Flexibility & Mobility",
            lessons: [
              {
                title: "Joint Mobility Basics",
                duration: "12:31",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Hip Flexibility Work",
                duration: "18:25",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Shoulder Mobility Training",
                duration: "14:19",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Hamstring Flexibility",
                duration: "15:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Foam Rolling Techniques",
                duration: "11:53",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Recovery & Relaxation",
                duration: "10:07",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Mobility Routine Guide",
                duration: "4:44",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Intermediate Pilates Flow",
            lessons: [
              {
                title: "Flow Sequence Basics",
                duration: "16:21",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Transitioning Between Exercises",
                duration: "12:42",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Advanced Leg Work",
                duration: "18:16",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Upper Body Integration",
                duration: "20:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Maintaining Rhythm & Tempo",
                duration: "11:50",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Building Full-Body Coordination",
                duration: "17:09",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Intermediate Flow Notes",
                duration: "5:16",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Professional level",
        progress: 0,
        modules: [
          {
            title: "Advanced Pilates Techniques",
            lessons: [
              {
                title: "Professional Warm-Up Systems",
                duration: "18:42",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Advanced Core Sequences",
                duration: "27:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "High-Level Flexibility Training",
                duration: "22:51",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Precision Movement Training",
                duration: "19:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Injury Prevention Methods",
                duration: "16:07",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Professional Class Demonstration",
                duration: "31:26",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Advanced Practice Workbook",
                duration: "7:30",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Client Coaching & Instruction",
            lessons: [
              {
                title: "Understanding Client Needs",
                duration: "15:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Building Training Programs",
                duration: "21:38",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Correcting Student Form",
                duration: "17:20",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Motivational Coaching",
                duration: "13:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Teaching Group Classes",
                duration: "24:11",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Handling Injured Clients",
                duration: "19:32",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Instructor Evaluation Sheet",
                duration: "5:08",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Business & Career Development",
            lessons: [
              {
                title: "Starting Your Pilates Career",
                duration: "12:35",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Building a Personal Brand",
                duration: "14:56",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Marketing Your Classes",
                duration: "18:47",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Social Media for Trainers",
                duration: "11:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Managing Clients Professionally",
                duration: "20:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Creating Long-Term Success",
                duration: "16:24",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Career Planning Workbook",
                duration: "4:59",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Mastery & Final Assessment",
            lessons: [
              {
                title: "Preparing for Certification",
                duration: "15:28",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Mock Practical Assessment",
                duration: "26:42",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Advanced Flow Demonstration",
                duration: "21:17",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Professional Teaching Evaluation",
                duration: "19:36",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Building Your Final Routine",
                duration: "17:50",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Final Course Wrap-Up",
                duration: "10:15",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Final Certification Guide",
                duration: "6:11",
                src: getRandomSrc(),
                type: "doc",
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
    reviewCount: "3.8k",

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

    modules: [
      {
        title: "Foundation level",
        progress: 40,
        modules: [
          {
            title: "Your Camera & Gear",
            lessons: [
              {
                title: "Welcome & Course Overview",
                duration: "3:10",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Camera Types Explained (DSLR vs Mirrorless)",
                duration: "11:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Understanding Camera Buttons & Dials",
                duration: "14:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Choosing the Right Lens",
                duration: "12:45",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Essential Accessories for Beginners",
                duration: "9:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Memory Cards, Storage & Backup",
                duration: "7:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Gear Checklist PDF",
                duration: "1:50",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Exposure & Camera Settings",
            lessons: [
              {
                title: "The Exposure Triangle Explained",
                duration: "16:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Mastering Aperture (f-stops)",
                duration: "13:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Shutter Speed: Freezing & Motion Blur",
                duration: "15:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "ISO & Noise Management",
                duration: "11:17",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Shooting in Manual Mode",
                duration: "19:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "White Balance & Colour Temperature",
                duration: "10:36",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Exposure Practice Assignment",
                duration: "4:00",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Shooting level",
        progress: 0,
        modules: [
          {
            title: "Composition & Framing",
            lessons: [
              {
                title: "Rule of Thirds in Practice",
                duration: "12:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Leading Lines & Visual Flow",
                duration: "10:52",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Framing & Negative Space",
                duration: "9:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Depth & Layers in a Shot",
                duration: "13:28",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Shooting Portraits That Pop",
                duration: "18:05",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Landscape Photography Techniques",
                duration: "20:31",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Composition Reference Guide",
                duration: "3:15",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Light & the Golden Hour",
            lessons: [
              {
                title: "Natural Light: Direction & Quality",
                duration: "14:20",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Shooting in Harsh Midday Sun",
                duration: "11:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Golden Hour & Blue Hour",
                duration: "16:53",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Using Reflectors & Diffusers",
                duration: "13:12",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Intro to Flash Photography",
                duration: "17:36",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Indoor Photography in Low Light",
                duration: "15:04",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Lighting Setup Cheatsheet",
                duration: "2:45",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Post-processing level",
        progress: 0,
        modules: [
          {
            title: "Editing in Lightroom",
            lessons: [
              {
                title: "Lightroom Interface Tour",
                duration: "10:10",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Importing & Organising Your Photos",
                duration: "8:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Basic Tone & Colour Adjustments",
                duration: "17:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Cropping, Straightening & Healing",
                duration: "12:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Working with Presets",
                duration: "14:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Exporting for Print & Social Media",
                duration: "9:19",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Lightroom Editing Workflow PDF",
                duration: "3:40",
                src: getRandomSrc(),
                type: "doc",
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
    reviewCount: "7.1k",

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

    modules: [
      {
        title: "Foundation level",
        progress: 0,
        modules: [
          {
            title: "UX Thinking & Research",
            lessons: [
              {
                title: "Welcome & Course Roadmap",
                duration: "4:15",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "What is UX? Principles & Goals",
                duration: "13:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Understanding Your Users",
                duration: "16:28",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Conducting User Interviews",
                duration: "21:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Creating User Personas",
                duration: "18:35",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Defining the Problem Statement",
                duration: "12:52",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "User Research Template",
                duration: "3:30",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Wireframing & Information Architecture",
            lessons: [
              {
                title: "What is Information Architecture?",
                duration: "10:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Sketching Your First Wireframes",
                duration: "14:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Building Low-Fidelity Wireframes in Figma",
                duration: "22:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "User Flows & Navigation Maps",
                duration: "17:56",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Card Sorting & Site Maps",
                duration: "13:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Gathering Wireframe Feedback",
                duration: "11:05",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Wireframe Review Checklist",
                duration: "2:50",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Design level",
        progress: 0,
        modules: [
          {
            title: "High-Fidelity Design in Figma",
            lessons: [
              {
                title: "Figma Interface & Shortcuts",
                duration: "12:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Typography in UI Design",
                duration: "15:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Colour Systems & Accessibility",
                duration: "18:02",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Designing Components & Variants",
                duration: "24:17",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Auto Layout & Responsive Frames",
                duration: "20:33",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Building a Design System from Scratch",
                duration: "28:41",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Design System Starter File",
                duration: "5:00",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Prototyping & Usability Testing",
            lessons: [
              {
                title: "Interactive Prototypes in Figma",
                duration: "16:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Micro-interactions & Transitions",
                duration: "14:56",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Planning a Usability Test",
                duration: "13:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Running Moderated Testing Sessions",
                duration: "19:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Analysing Test Results & Iterating",
                duration: "17:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "A/B Testing Fundamentals",
                duration: "11:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Usability Test Script Template",
                duration: "3:10",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Professional level",
        progress: 0,
        modules: [
          {
            title: "Accessibility & Inclusive Design",
            lessons: [
              {
                title: "Why Accessibility Matters",
                duration: "10:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "WCAG Guidelines in Practice",
                duration: "16:37",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Colour Contrast & Text Legibility",
                duration: "12:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Designing for Screen Readers",
                duration: "15:20",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Inclusive Motion & Animations",
                duration: "11:33",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Accessibility Audit Checklist",
                duration: "3:45",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Design Handoff & Collaboration",
            lessons: [
              {
                title: "Preparing Files for Developers",
                duration: "14:12",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Writing Design Specs & Annotations",
                duration: "12:58",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Using Dev Mode in Figma",
                duration: "16:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Version Control & Design Reviews",
                duration: "13:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Presenting Your Work to Stakeholders",
                duration: "18:06",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Building Your UX Portfolio",
                duration: "22:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Portfolio Case Study Template",
                duration: "4:20",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Python for Data Science
  // ─────────────────────────────────────────────────────────────────────────
  {
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
    reviewCount: "9.4k",

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

    modules: [
      {
        title: "Python Fundamentals",
        progress: 0,
        modules: [
          {
            title: "Python Crash Course",
            lessons: [
              {
                title: "Setting Up Python & Jupyter Notebook",
                duration: "8:42",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Variables, Data Types & Operators",
                duration: "15:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Lists, Tuples & Dictionaries",
                duration: "19:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Control Flow: If, Loops & Functions",
                duration: "22:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Writing Clean Python Code",
                duration: "12:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Intro to OOP in Python",
                duration: "18:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Python Cheat Sheet",
                duration: "2:00",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "NumPy & Pandas Fundamentals",
            lessons: [
              {
                title: "What is NumPy? Arrays & Operations",
                duration: "16:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Indexing, Slicing & Reshaping Arrays",
                duration: "14:28",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Intro to Pandas DataFrames",
                duration: "18:52",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Cleaning & Handling Missing Data",
                duration: "21:17",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Grouping, Merging & Pivoting Data",
                duration: "23:06",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Reading CSV, JSON & Excel Files",
                duration: "10:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Pandas Reference Notebook",
                duration: "3:20",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Data Analysis & Visualisation",
        progress: 0,
        modules: [
          {
            title: "Visualisation with Matplotlib & Seaborn",
            lessons: [
              {
                title: "Matplotlib Basics: Plots & Subplots",
                duration: "15:33",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Customising Charts: Labels, Colours & Styles",
                duration: "13:20",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Seaborn for Statistical Visualisation",
                duration: "17:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Heatmaps, Pair Plots & Distributions",
                duration: "19:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Interactive Charts with Plotly",
                duration: "16:05",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Telling Stories with Data",
                duration: "14:42",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Visualisation Style Guide",
                duration: "2:55",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Exploratory Data Analysis (EDA)",
            lessons: [
              {
                title: "The EDA Process End-to-End",
                duration: "20:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Descriptive Statistics in Pandas",
                duration: "14:36",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Correlation & Feature Relationships",
                duration: "16:52",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Detecting & Handling Outliers",
                duration: "15:28",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Feature Engineering Basics",
                duration: "18:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "EDA Project: Real Dataset Walkthrough",
                duration: "31:15",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "EDA Checklist & Notes",
                duration: "4:10",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Machine Learning",
        progress: 0,
        modules: [
          {
            title: "Intro to Machine Learning with Scikit-Learn",
            lessons: [
              {
                title: "ML Concepts: Supervised vs Unsupervised",
                duration: "12:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Train/Test Split & Cross-Validation",
                duration: "15:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Linear & Logistic Regression",
                duration: "22:10",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Decision Trees & Random Forests",
                duration: "24:35",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Model Evaluation: Accuracy, Precision & Recall",
                duration: "18:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Hyperparameter Tuning with GridSearchCV",
                duration: "19:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "ML Model Comparison Sheet",
                duration: "3:30",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Capstone Projects",
            lessons: [
              {
                title: "Project 1: Sales Forecasting",
                duration: "35:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Project 2: Customer Churn Prediction",
                duration: "40:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Project 3: Housing Price Regression",
                duration: "38:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Presenting Your ML Project",
                duration: "16:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Capstone Project Submission Guide",
                duration: "5:15",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Guitar for Beginners
  // ─────────────────────────────────────────────────────────────────────────
  {
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
    reviewCount: "2.3k",

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

    modules: [
      {
        title: "Starter level",
        progress: 65,
        modules: [
          {
            title: "Getting Started with Guitar",
            lessons: [
              {
                title: "Welcome & What You'll Need",
                duration: "3:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Guitar Anatomy: Parts & Their Purpose",
                duration: "8:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "How to Hold Your Guitar & Pick",
                duration: "6:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Tuning Your Guitar (by Ear & App)",
                duration: "7:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Reading Chord Diagrams & Tabs",
                duration: "10:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Finger Exercises for Beginners",
                duration: "9:02",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Beginner Guitar Setup Guide",
                duration: "2:10",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Essential Open Chords",
            lessons: [
              {
                title: "Your First 3 Chords: G, C, D",
                duration: "14:36",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Em, Am & E Minor Shapes",
                duration: "12:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Clean Chord Transitions",
                duration: "11:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "F Chord: The Beginner's Challenge",
                duration: "15:10",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Common Chord Progressions",
                duration: "13:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Chord Chart PDF",
                duration: "1:30",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Player level",
        progress: 0,
        modules: [
          {
            title: "Strumming Patterns & Rhythm",
            lessons: [
              {
                title: "Down Strums & Basic Rhythm",
                duration: "9:50",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Down-Up Strumming Patterns",
                duration: "11:35",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "The 8th-Note Strum Pattern",
                duration: "13:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Adding Muting & Accents",
                duration: "14:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Fingerpicking Basics",
                duration: "17:02",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Strumming Practice Loop Files",
                duration: "2:30",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Playing Your First 10 Songs",
            lessons: [
              {
                title: "Song 1: Knockin' on Heaven's Door",
                duration: "18:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Song 2: Wonderwall",
                duration: "21:15",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Song 3: Let Her Go",
                duration: "19:52",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Song 4: Horse With No Name",
                duration: "17:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Song 5: Brown Eyed Girl",
                duration: "22:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Songs 6–10: Guided Walkthrough",
                duration: "48:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Song Tabs & Chord Sheets",
                duration: "3:00",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Advanced Web Development
  // ─────────────────────────────────────────────────────────────────────────
  {
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
    reviewCount: "4.6k",

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

    modules: [
      {
        title: "Intermediate level",
        progress: 0,
        modules: [
          {
            title: "TypeScript Deep Dive",
            lessons: [
              {
                title: "Advanced Types: Union, Intersection & Generics",
                duration: "24:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Utility Types: Partial, Pick, Omit & More",
                duration: "18:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Type Guards & Narrowing",
                duration: "16:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "TypeScript with React: Props & State Patterns",
                duration: "21:52",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Strict Mode & Eliminating `any`",
                duration: "14:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Declaration Files & Third-Party Types",
                duration: "12:36",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "TypeScript Pattern Reference Guide",
                duration: "4:00",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Next.js App Router & Server Components",
            lessons: [
              {
                title: "App Router Architecture Overview",
                duration: "20:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Server Components vs Client Components",
                duration: "22:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Data Fetching: fetch, cache & revalidate",
                duration: "25:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Loading UI & Suspense Boundaries",
                duration: "17:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Error Boundaries & Not Found Pages",
                duration: "14:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Route Handlers & Middleware",
                duration: "19:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Parallel & Intercepting Routes",
                duration: "18:10",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Next.js App Router Cheatsheet",
                duration: "3:50",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Advanced level",
        progress: 0,
        modules: [
          {
            title: "Performance & Core Web Vitals",
            lessons: [
              {
                title: "Understanding LCP, FID/INP & CLS",
                duration: "15:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Image Optimisation with next/image",
                duration: "13:28",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Font Loading & Layout Shift Prevention",
                duration: "11:52",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Bundle Analysis & Code Splitting",
                duration: "18:36",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "React Performance: Memo, useCallback & Profiler",
                duration: "22:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Caching Strategies: Stale-While-Revalidate",
                duration: "16:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Performance Audit Checklist",
                duration: "3:15",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "Testing with Vitest & Playwright",
            lessons: [
              {
                title: "Testing Philosophy: Unit, Integration & E2E",
                duration: "12:08",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Setting Up Vitest in a Next.js Project",
                duration: "10:55",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Writing Unit Tests for Utilities & Hooks",
                duration: "19:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Component Testing with React Testing Library",
                duration: "23:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Mocking APIs & Modules",
                duration: "17:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "E2E Testing with Playwright",
                duration: "28:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Test Coverage Reports & CI Integration",
                duration: "15:06",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Testing Strategy Reference Doc",
                duration: "4:30",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
      {
        title: "Senior / Expert level",
        progress: 0,
        modules: [
          {
            title: "System Design for Frontend Engineers",
            lessons: [
              {
                title: "Thinking in Systems: Scale & Trade-offs",
                duration: "18:22",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Monorepo Architecture with Turborepo",
                duration: "24:10",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Micro-frontends: When & How",
                duration: "20:48",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "API Design: REST, GraphQL & tRPC",
                duration: "22:36",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "State Management at Scale",
                duration: "19:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Designing Component Libraries",
                duration: "17:40",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "System Design Interview Notes",
                duration: "5:00",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
          {
            title: "CI/CD, Monitoring & Deployment",
            lessons: [
              {
                title: "GitHub Actions for Frontend Projects",
                duration: "16:28",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Automated Linting, Formatting & Type Checks",
                duration: "12:14",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Deploying to Vercel: Environments & Previews",
                duration: "14:52",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Feature Flags & Incremental Rollouts",
                duration: "17:30",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Error Monitoring with Sentry",
                duration: "13:44",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Analytics, Logging & Observability",
                duration: "15:18",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Final Capstone: Full-Stack Production App",
                duration: "52:00",
                src: getRandomSrc(),
                type: "video",
              },
              {
                title: "Deployment & DevOps Runbook",
                duration: "5:30",
                src: getRandomSrc(),
                type: "doc",
              },
            ],
          },
        ],
      },
    ],
  },
];
