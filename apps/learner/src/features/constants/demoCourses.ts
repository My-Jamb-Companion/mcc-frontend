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

export const courseDetails = [
  {
    slug: "pilates-teacher-training",
    instructor: "Benedict Laura",
    title: "Pilates Teacher Training Certification 20 CPD Points",
    description:
      "Realise your dreams and train to be a Classical Mat Pilates instructor with this accredited Teacher Training course",

    // Card image (thumbnail shown on the card)
    imgBig: "/assets/images/tower.jpg",
    imgSmall: "/assets/images/pencil.jpg",

    // Pricing
    price: 2345,
    originalPrice: 3500,
    pricePerModule: 75.95,
    currency: "₦",

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
];
