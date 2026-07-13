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
  units: ExamUnit[];
}

interface Lesson {
  id: string;
  title: string;
  icon: string;
}

export interface ExamUnit {
  id: string;
  title: string;
  totalLessons: number;
  status: "resume" | "start";
  lessons: Lesson[];
}
const LESSON_ICON = "solar:widget-4-bold";
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
    units: [
      {
        id: "english-foundations",
        title: "English Foundations",
        totalLessons: 6,
        status: "resume",
        lessons: [
          {
            id: "grammar-basics",
            title: "Grammar basics & sentence structure",
            icon: LESSON_ICON,
          },
          {
            id: "parts-of-speech",
            title: "Parts of speech & their functions",
            icon: LESSON_ICON,
          },
          {
            id: "punctuation-spelling",
            title: "Punctuation rules & spelling standards",
            icon: LESSON_ICON,
          },
          {
            id: "vocab-building",
            title: "Vocabulary expansion strategies",
            icon: LESSON_ICON,
          },
          {
            id: "reading-comprehension",
            title: "Reading comprehension techniques",
            icon: LESSON_ICON,
          },
          {
            id: "essay-structure",
            title: "Essay structure & paragraph organization",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "use-of-english",
        title: "Use of English",
        totalLessons: 8,
        status: "resume",
        lessons: [
          {
            id: "oral-comprehension",
            title: "Oral comprehension & interpretation",
            icon: LESSON_ICON,
          },
          {
            id: "summary-writing",
            title: "Summarizing texts effectively",
            icon: LESSON_ICON,
          },
          {
            id: "essays-writing",
            title: "Argumentative & narrative essay writing",
            icon: LESSON_ICON,
          },
          {
            id: "grammar-application",
            title: "Applied grammar in context",
            icon: LESSON_ICON,
          },
          {
            id: "sentence-construction",
            title: "Effective sentence construction",
            icon: LESSON_ICON,
          },
          {
            id: "vocabulary-usage",
            title: "Correct vocabulary usage in writing",
            icon: LESSON_ICON,
          },
          {
            id: "comprehension-skills",
            title: "Advanced comprehension skills",
            icon: LESSON_ICON,
          },
          {
            id: "orals-drills",
            title: "Oral drills & presentation practice",
            icon: LESSON_ICON,
          },
        ],
      },
    ],
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
    units: [
      {
        id: "pre-algebra-a",
        title: "Pre-Algebra (Part 1)",
        totalLessons: 8,
        status: "resume",
        lessons: [
          {
            id: "arithmetic-prop",
            title: "Arithmetic properties & order of operations",
            icon: LESSON_ICON,
          },
          {
            id: "integers-negatives",
            title: "Working with negative integers",
            icon: LESSON_ICON,
          },
          {
            id: "fractions-basics",
            title: "Fractions visualization & basic operations",
            icon: LESSON_ICON,
          },
          {
            id: "decimals-conversion",
            title: "Decimals, percents, & conversions",
            icon: LESSON_ICON,
          },
          {
            id: "factors-multiples",
            title: "Factors, primes, & greatest common divisors",
            icon: LESSON_ICON,
          },
          {
            id: "intro-variables",
            title: "Introduction to variables & expressions",
            icon: LESSON_ICON,
          },
          {
            id: "combining-like-terms",
            title: "Combining like terms simplifies expressions",
            icon: LESSON_ICON,
          },
          {
            id: "coordinate-plane",
            title: "The coordinate plane & plotting points",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "pre-algebra-b",
        title: "Pre-Algebra (Part 2)",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "one-step-eq",
            title: "Solving one-step equations",
            icon: LESSON_ICON,
          },
          {
            id: "ratios-rates",
            title: "Ratios, rates, & proportions",
            icon: LESSON_ICON,
          },
          {
            id: "percent-word-probs",
            title: "Percent word problems & growth",
            icon: LESSON_ICON,
          },
          {
            id: "exponents-intro",
            title: "Exponents & powers of ten",
            icon: LESSON_ICON,
          },
          {
            id: "square-roots",
            title: "Square roots & perfect squares",
            icon: LESSON_ICON,
          },
          {
            id: "scientific-notation",
            title: "Scientific notation mechanics",
            icon: LESSON_ICON,
          },
          {
            id: "basic-geometry",
            title: "Area, perimeter, & volume foundations",
            icon: LESSON_ICON,
          },
          {
            id: "angles-lines",
            title: "Angles, parallel lines, & transversals",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "algebra-1",
        title: "Algebra 1",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "multi-step-eq",
            title: "Solving multi-step equations",
            icon: LESSON_ICON,
          },
          {
            id: "linear-inequalities",
            title: "Linear inequalities & interval notation",
            icon: LESSON_ICON,
          },
          {
            id: "slope-intercept",
            title: "Slope & slope-intercept form",
            icon: LESSON_ICON,
          },
          {
            id: "graphing-linear",
            title: "Graphing linear equations & functions",
            icon: LESSON_ICON,
          },
          {
            id: "sys-substitution",
            title: "Systems of equations via substitution",
            icon: LESSON_ICON,
          },
          {
            id: "sys-elimination",
            title: "Systems of equations via elimination",
            icon: LESSON_ICON,
          },
          {
            id: "exponent-laws",
            title: "Laws of exponents & radical expressions",
            icon: LESSON_ICON,
          },
          {
            id: "quadratics-intro",
            title: "Introduction to factoring quadratics",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "algebra-2-a",
        title: "Algebra 2: Functions & Trigonometry",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "complex-nums",
            title: "Complex & imaginary numbers",
            icon: LESSON_ICON,
          },
          {
            id: "poly-arithmetic",
            title: "Polynomial addition, subtraction, & multiplication",
            icon: LESSON_ICON,
          },
          {
            id: "poly-division",
            title: "Synthetic & long polynomial division",
            icon: LESSON_ICON,
          },
          {
            id: "rational-func",
            title: "Graphing rational & radical functions",
            icon: LESSON_ICON,
          },
          {
            id: "unit-circle",
            title: "The unit circle & radian measures",
            icon: LESSON_ICON,
          },
          {
            id: "trig-functions",
            title: "Sine, cosine, & tangent graphs",
            icon: LESSON_ICON,
          },
          {
            id: "trig-identities",
            title: "Pythagorean & basic trig identities",
            icon: LESSON_ICON,
          },
          {
            id: "inverse-trig",
            title: "Inverse trigonometric functions",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "algebra-2-b",
        title: "Algebra 2: Advanced Exponents",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "log-properties",
            title: "Properties of logarithms",
            icon: LESSON_ICON,
          },
          {
            id: "natural-log",
            title: "The natural log & base e",
            icon: LESSON_ICON,
          },
          {
            id: "exponential-models",
            title: "Solving exponential growth models",
            icon: LESSON_ICON,
          },
          {
            id: "transformations",
            title: "Function transformations & symmetry",
            icon: LESSON_ICON,
          },
          {
            id: "piecewise-functions",
            title: "Graphing piecewise & absolute value functions",
            icon: LESSON_ICON,
          },
          {
            id: "matrix-operations",
            title: "Matrix arithmetic & determinants",
            icon: LESSON_ICON,
          },
          {
            id: "inverse-matrices",
            title: "Solving systems using inverse matrices",
            icon: LESSON_ICON,
          },
          {
            id: "series-sequences",
            title: "Arithmetic & geometric sequences",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "algebra-2-c",
        title: "Algebra 2: Data & Probability",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "permutations",
            title: "Permutations & combinations formula",
            icon: LESSON_ICON,
          },
          {
            id: "conditional-prob",
            title: "Conditional probability & independence",
            icon: LESSON_ICON,
          },
          {
            id: "prob-distributions",
            title: "Binomial probability distributions",
            icon: LESSON_ICON,
          },
          {
            id: "normal-curve",
            title: "The normal curve & z-scores",
            icon: LESSON_ICON,
          },
          {
            id: "stats-sampling",
            title: "Sampling methods & bias control",
            icon: LESSON_ICON,
          },
          {
            id: "stats-inference",
            title: "Confidence intervals & hypothesis testing",
            icon: LESSON_ICON,
          },
          {
            id: "conic-circles",
            title: "Conic sections: Circles & parabolas",
            icon: LESSON_ICON,
          },
          {
            id: "conic-ellipses",
            title: "Conic sections: Ellipses & hyperbolas",
            icon: LESSON_ICON,
          },
        ],
      },
    ],
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
    units: [
      {
        id: "bio-foundations",
        title: "Cell Biology & Energetics",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "bio-macromolecules",
            title: "Carbohydrates, lipids, proteins, & nucleic acids",
            icon: LESSON_ICON,
          },
          {
            id: "cell-structure",
            title: "Prokaryotic vs. eukaryotic organelles",
            icon: LESSON_ICON,
          },
          {
            id: "membrane-transport",
            title: "Passive diffusion & active transport pumps",
            icon: LESSON_ICON,
          },
          {
            id: "osmosis-tonicity",
            title: "Osmosis, tonicity, & hypertonic environments",
            icon: LESSON_ICON,
          },
          {
            id: "enzymes-catalysis",
            title: "Enzyme kinetics & activation energy",
            icon: LESSON_ICON,
          },
          {
            id: "glycolysis-krebs",
            title: "Glycolysis & the Krebs cycle",
            icon: LESSON_ICON,
          },
          {
            id: "electron-transport",
            title: "The electron transport chain & oxidative phosphorylation",
            icon: LESSON_ICON,
          },
          {
            id: "photosynthesis",
            title: "Light-dependent reactions & Calvin cycle",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "bio-genetics",
        title: "Genetics & Molecular Biology",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "dna-structure",
            title: "DNA double helix & base pairing rules",
            icon: LESSON_ICON,
          },
          {
            id: "dna-replication",
            title: "DNA replication forks & lagging strands",
            icon: LESSON_ICON,
          },
          {
            id: "transcription",
            title: "RNA transcription & processing",
            icon: LESSON_ICON,
          },
          {
            id: "translation",
            title: "Ribosomes & protein translation mechanics",
            icon: LESSON_ICON,
          },
          {
            id: "mitosis-cycle",
            title: "The cell cycle checkpoints & mitosis steps",
            icon: LESSON_ICON,
          },
          {
            id: "meiosis-crossing",
            title: "Meiosis & genetic crossing over",
            icon: LESSON_ICON,
          },
          {
            id: "mendelian-genetics",
            title: "Monohybrid crosses & homozygous profiles",
            icon: LESSON_ICON,
          },
          {
            id: "non-mendelian",
            title: "Codominance, incomplete dominance, & sex-linked traits",
            icon: LESSON_ICON,
          },
        ],
      },
    ],
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
    units: [
      {
        id: "chem-atomic",
        title: "Atoms & Elements",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "atomic-theory",
            title: "History of atomic theory & subatomic particles",
            icon: LESSON_ICON,
          },
          {
            id: "isotopes-mass",
            title: "Isotopes & calculating average atomic mass",
            icon: LESSON_ICON,
          },
          {
            id: "electron-config",
            title: "Electron configurations & orbital diagrams",
            icon: LESSON_ICON,
          },
          {
            id: "periodic-trends",
            title: "Ionization energy, electronegativity, & atomic radii",
            icon: LESSON_ICON,
          },
          {
            id: "ionic-bonding",
            title: "Ionic bonding & crystal lattice structures",
            icon: LESSON_ICON,
          },
          {
            id: "covalent-bonding",
            title: "Covalent bonding & Lewis dot structures",
            icon: LESSON_ICON,
          },
          {
            id: "molecular-shapes",
            title: "VSEPR theory & 3D molecular structures",
            icon: LESSON_ICON,
          },
          {
            id: "intermolecular-forces",
            title: "Dipole interactions & hydrogen bonding forces",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "chem-reactions",
        title: "Chemical Reactions & Stoichiometry",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "reaction-types",
            title: "Synthesis, decomposition, & combustion reactions",
            icon: LESSON_ICON,
          },
          {
            id: "balancing-eq",
            title: "Balancing complex chemical equations",
            icon: LESSON_ICON,
          },
          {
            id: "the-mole",
            title: "Avogadro's number & the mole concept",
            icon: LESSON_ICON,
          },
          {
            id: "molar-mass-calc",
            title: "Calculating molar mass & empirical formulas",
            icon: LESSON_ICON,
          },
          {
            id: "stoichiometry-mass",
            title: "Mass-to-mass stoichiometry calculations",
            icon: LESSON_ICON,
          },
          {
            id: "limiting-reactants",
            title: "Identifying limiting reactants & theoretical yield",
            icon: LESSON_ICON,
          },
          {
            id: "solutions-molarity",
            title: "Molarity concentration & solution dilutions",
            icon: LESSON_ICON,
          },
          {
            id: "gas-laws",
            title: "Ideal gas laws & gas stoichiometry",
            icon: LESSON_ICON,
          },
        ],
      },
    ],
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
    units: [
      {
        id: "lit-origins",
        title: "Origins of English & Early Forms",
        totalLessons: 6,
        status: "start",
        lessons: [
          {
            id: "old-english",
            title: "Old English literature & oral traditions",
            icon: LESSON_ICON,
          },
          {
            id: "middle-english",
            title: "Middle English romance & Chaucer's influence",
            icon: LESSON_ICON,
          },
          {
            id: "renaissance-poetry",
            title: "Renaissance lyric poetry & sonnet forms",
            icon: LESSON_ICON,
          },
          {
            id: "shakespeare-origins",
            title: "Shakespeare's dramatic influences",
            icon: LESSON_ICON,
          },
          {
            id: "poetry-terms",
            title: "Figurative language in poetry",
            icon: LESSON_ICON,
          },
          {
            id: "verse-forms",
            title: "Meter, rhyme, & verse structures",
            icon: LESSON_ICON,
          },
        ],
      },
      {
        id: "lit-novel",
        title: "The Novel & Prose Fiction",
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "origins-novel",
            title: "Rise of the English novel",
            icon: LESSON_ICON,
          },
          {
            id: "18th-century-novel",
            title: "18th-century realism & character development",
            icon: LESSON_ICON,
          },
          {
            id: "19th-century-novel",
            title: "Victorian novels & social critique",
            icon: LESSON_ICON,
          },
          {
            id: "modernist-novel",
            title:
              "Modernism, stream of consciousness, & fragmented narratives",
            icon: LESSON_ICON,
          },
          {
            id: "postcolonial-novel",
            title: "Postcolonial narratives & identity themes",
            icon: LESSON_ICON,
          },
          {
            id: "prose-fiction-analysis",
            title: "Characterization, setting, & narrative voice",
            icon: LESSON_ICON,
          },
          {
            id: "satire-humor",
            title: "Satire, irony, & comic devices",
            icon: LESSON_ICON,
          },
          {
            id: "plot-structure",
            title: "Story structure & plot devices",
            icon: LESSON_ICON,
          },
        ],
      },
    ],
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
