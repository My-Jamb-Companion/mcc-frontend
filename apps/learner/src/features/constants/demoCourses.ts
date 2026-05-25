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

export const courseDetails: CourseDetail[] = [
  {
    slug: "pilates-teacher-training",
    instructor: "Benedict Laura",
    title: "Pilates Teacher Training Certification 20 CPD Points",
    description:
      "Realise your dreams and train to be a Classical Mat Pilates instructor with this accredited Teacher Training course",

    // Card image (thumbnail shown on the card)
    imgBig: "/assets/images/courses/pilatis-big.jpg",
    imgSmall: "/assets/images/courses/pilatis-small.jpg",

    // Pricing
    price: 2345,
    originalPrice: 3500,
    pricePerModule: 75.95,
    currency: "₦",
    isEnrolled: true,

    // Rating
    rating: 4.7,
    reviewCount: "5.2k",

    // Tags — first 2 visible on card, rest counted as +8
    tags: ["Procreate", "Drawing Tablet", "Beginner", "Digital Art", "iPad"],
    extraTagsCount: 8,

    // ---- Everything below is for the expanded/detail page ----

    previewVideo: "/videos/pilates-preview.mp4",
    totalRatings: 254,

    meta: {
      lessons: 16,
      difficulty: "Moderate" as "Beginner" | "Moderate" | "Advanced",
    },

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
  },

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

    meta: {
      lessons: 22,
      difficulty: "Beginner" as "Beginner" | "Moderate" | "Advanced",
    },

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
  },

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

    meta: {
      lessons: 34,
      difficulty: "Moderate" as "Beginner" | "Moderate" | "Advanced",
    },

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
  },

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

    meta: {
      lessons: 41,
      difficulty: "Moderate" as "Beginner" | "Moderate" | "Advanced",
    },

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
  },

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

    meta: {
      lessons: 25,
      difficulty: "Beginner" as "Beginner" | "Moderate" | "Advanced",
    },

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
  },

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

    meta: {
      lessons: 52,
      difficulty: "Advanced" as "Beginner" | "Moderate" | "Advanced",
    },

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

export type CourseDetail = {
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
};
