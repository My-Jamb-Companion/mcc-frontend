import {Difficulty, CurriculumSection} from "./demoCourses";

export interface ExamDetail {
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
  //   curriculums: CourseLevel[];
  subjects: ExamSubject[];
}

export interface ExamSubject {
  id: string;
  name: string;
  description: string;
  price: number;
  diamonds: number;
  opening: string;
  isEnrolled: boolean;
}

export const UTME_SUBJECTS: ExamSubject[] = [
  {
    id: "use-of-english",
    name: "Use of English",
    description:
      "Resources are based off the JAMB curriculum with multiple study styles",
    price: 135.95,
    diamonds: 29,
    opening: "4 months opening",
    isEnrolled: true,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description:
      "Resources are based off the JAMB curriculum with multiple study styles",
    price: 105.95,
    diamonds: 25,
    opening: "3.5 months opening",
    isEnrolled: false,
  },
  {
    id: "biology",
    name: "Biology",
    description:
      "Resources are based off the JAMB curriculum with multiple study styles",
    price: 75.95,
    diamonds: 21,
    opening: "2 months opening",
    isEnrolled: false,
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description:
      "Resources are based off the JAMB curriculum with multiple study styles",
    price: 95.95,
    diamonds: 26,
    opening: "3 months opening",
    isEnrolled: true,
  },
  {
    id: "literature",
    name: "Literature",
    description:
      "Resources are based off the JAMB curriculum with multiple study styles",
    price: 85.95,
    diamonds: 24,
    opening: "3 months opening",
    isEnrolled: false,
  },
];

export const examDetails: ExamDetail[] = [
  {
    id: 12323,
    slug: "utme",
    instructor: "MCC Tutors",
    title: "Joint Admission and Matriculation Board Exam",
    description:
      "JAMB UTME is a mandatory computer-based test for admission into tertiary institutions in Nigeria. Prepare for JAMB UTME with our comprehensive exam prep courses, covering all subjects and topics required for the exam.",

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
    subjects: [...UTME_SUBJECTS],

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
];
