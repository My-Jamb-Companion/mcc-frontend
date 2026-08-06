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

export type SubLessonNode = TopicNode | CheckpointNode;
export interface ExamLesson {
  id: string;
  title: string;
  icon: string;
  about: {
    intro: string;
    note: string;
  };
  subLessons: SubLessonNode[];
}

export interface ExamUnit {
  id: string;
  title: string;
  totalLessons: number;
  status: "resume" | "start";
  lessons: ExamLesson[];
}

interface Practice {
  title: string;
  subtitle: string;
  upNext?: boolean;
}

interface TopicNode {
  id: string;
  type: "topic";
  title: string;
  learnItems: {id: string; title: string; src: string; type: string}[];
  practice?: Practice;
}

interface CheckpointNode {
  id: string;
  type: "quiz" | "test" | "doc" | "video";
  title: string;
  description?: string;
  document?: string;
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
            title: "Grammar Basics & Sentence Structure",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "sentence-types",
                title: "Types of Sentences",
                type: "practice",
              },
              {
                id: "subject-predicate",
                title: "Subject & Predicate",
                type: "quiz",
              },
              {
                id: "phrases-clauses",
                title: "Phrases & Clauses",
                type: "practice",
              },
              {
                id: "sentence-patterns",
                title: "Sentence Patterns",
                type: "practice",
              },
              {
                id: "grammar-errors",
                title: "Common Grammar Errors",
                type: "test",
              },
            ],
          },
          {
            id: "parts-of-speech",
            title: "Parts of Speech & Their Functions",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "nouns",
                title: "Nouns",
                type: "practice",
              },
              {
                id: "pronouns",
                title: "Pronouns",
                type: "practice",
              },
              {
                id: "verbs",
                title: "Verbs",
                type: "quiz",
              },
              {
                id: "adjectives-adverbs",
                title: "Adjectives & Adverbs",
                type: "practice",
              },
              {
                id: "prepositions-conjunctions",
                title: "Prepositions, Conjunctions & Interjections",
                type: "test",
              },
            ],
          },
          {
            id: "punctuation-spelling",
            title: "Punctuation Rules & Spelling Standards",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "comma-period",
                title: "Comma & Full Stop Usage",
                type: "practice",
              },
              {
                id: "quotation-marks",
                title: "Quotation Marks & Apostrophes",
                type: "practice",
              },
              {
                id: "capitalization",
                title: "Capitalization Rules",
                type: "quiz",
              },
              {
                id: "british-spelling",
                title: "British English Spellings",
                type: "practice",
              },
              {
                id: "spelling-errors",
                title: "Common Spelling Mistakes",
                type: "test",
              },
            ],
          },
          {
            id: "vocab-building",
            title: "Vocabulary Expansion Strategies",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "context-clues",
                title: "Using Context Clues",
                type: "practice",
              },
              {
                id: "word-formation",
                title: "Word Formation",
                type: "practice",
              },
              {
                id: "synonyms",
                title: "Synonyms & Antonyms",
                type: "quiz",
              },
              {
                id: "idiomatic-usage",
                title: "Idiomatic Expressions",
                type: "practice",
              },
              {
                id: "jamb-vocabulary",
                title: "High-Frequency JAMB Vocabulary",
                type: "test",
              },
            ],
          },
          {
            id: "reading-comprehension",
            title: "Reading Comprehension Techniques",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "main-idea",
                title: "Finding the Main Idea",
                type: "practice",
              },
              {
                id: "supporting-details",
                title: "Supporting Details",
                type: "practice",
              },
              {
                id: "making-inferences",
                title: "Making Inferences",
                type: "quiz",
              },
              {
                id: "author-purpose",
                title: "Author's Purpose & Tone",
                type: "practice",
              },
              {
                id: "answering-questions",
                title: "Answering Comprehension Questions",
                type: "test",
              },
            ],
          },
          {
            id: "essay-structure",
            title: "Essay Structure & Paragraph Organization",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "essay-introduction",
                title: "Writing Introductions",
                type: "practice",
              },
              {
                id: "body-paragraphs",
                title: "Developing Body Paragraphs",
                type: "practice",
              },
              {
                id: "conclusions",
                title: "Writing Conclusions",
                type: "quiz",
              },
              {
                id: "coherence",
                title: "Paragraph Unity & Coherence",
                type: "practice",
              },
              {
                id: "essay-editing",
                title: "Editing & Proofreading Essays",
                type: "test",
              },
            ],
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
            title: "Oral Comprehension & Interpretation",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "vowel-sounds",
                title: "Vowel Sounds",
                type: "practice",
              },
              {
                id: "consonant-sounds",
                title: "Consonant Sounds",
                type: "practice",
              },
              {
                id: "stress-patterns",
                title: "Word Stress",
                type: "quiz",
              },
              {
                id: "intonation",
                title: "Intonation Patterns",
                type: "practice",
              },
              {
                id: "minimal-pairs",
                title: "Minimal Pairs Practice",
                type: "test",
              },
            ],
          },
          {
            id: "summary-writing",
            title: "Summarizing Texts Effectively",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "identify-main-points",
                title: "Identifying Main Points",
                type: "practice",
              },
              {
                id: "remove-details",
                title: "Removing Unnecessary Details",
                type: "practice",
              },
              {
                id: "paraphrasing",
                title: "Paraphrasing Skills",
                type: "quiz",
              },
              {
                id: "concise-writing",
                title: "Writing Concisely",
                type: "practice",
              },
              {
                id: "summary-practice",
                title: "Summary Practice",
                type: "test",
              },
            ],
          },
          {
            id: "essays-writing",
            title: "Argumentative & Narrative Essay Writing",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "argumentative",
                title: "Argumentative Essays",
                type: "practice",
              },
              {
                id: "narrative",
                title: "Narrative Essays",
                type: "practice",
              },
              {
                id: "descriptive",
                title: "Descriptive Essays",
                type: "quiz",
              },
              {
                id: "expository",
                title: "Expository Essays",
                type: "practice",
              },
              {
                id: "essay-marking",
                title: "Essay Assessment Tips",
                type: "test",
              },
            ],
          },
          {
            id: "grammar-application",
            title: "Applied Grammar in Context",
            icon: LESSON_ICON,
            subLessons: [
              {id: "tenses", title: "Tenses", type: "practice"},
              {
                id: "active-passive",
                title: "Active & Passive Voice",
                type: "practice",
              },
              {
                id: "direct-indirect",
                title: "Direct & Indirect Speech",
                type: "quiz",
              },
              {
                id: "agreement",
                title: "Subject-Verb Agreement",
                type: "practice",
              },
              {
                id: "grammar-practice",
                title: "Grammar Exercises",
                type: "test",
              },
            ],
          },
          {
            id: "sentence-construction",
            title: "Effective Sentence Construction",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "simple-sentences",
                title: "Simple Sentences",
                type: "practice",
              },
              {
                id: "compound-sentences",
                title: "Compound Sentences",
                type: "practice",
              },
              {
                id: "complex-sentences",
                title: "Complex Sentences",
                type: "quiz",
              },
              {
                id: "sentence-variety",
                title: "Sentence Variety",
                type: "practice",
              },
              {
                id: "sentence-revision",
                title: "Sentence Revision",
                type: "test",
              },
            ],
          },
          {
            id: "vocabulary-usage",
            title: "Correct Vocabulary Usage in Writing",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "word-choice",
                title: "Choosing the Right Words",
                type: "practice",
              },
              {
                id: "confusing-words",
                title: "Commonly Confused Words",
                type: "practice",
              },
              {id: "collocations", title: "Collocations", type: "quiz"},
              {id: "registers", title: "Registers", type: "practice"},
              {
                id: "vocabulary-practice",
                title: "Vocabulary Practice",
                type: "test",
              },
            ],
          },
          {
            id: "comprehension-skills",
            title: "Advanced Comprehension Skills",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "critical-reading",
                title: "Critical Reading",
                type: "practice",
              },
              {
                id: "drawing-conclusions",
                title: "Drawing Conclusions",
                type: "practice",
              },
              {
                id: "vocabulary-context",
                title: "Vocabulary in Context",
                type: "quiz",
              },
              {id: "text-analysis", title: "Text Analysis", type: "practice"},
              {
                id: "comprehension-tests",
                title: "Comprehension Tests",
                type: "test",
              },
            ],
          },
          {
            id: "orals-drills",
            title: "Oral Drills & Presentation Practice",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "pronunciation",
                title: "Pronunciation Practice",
                type: "practice",
              },
              {id: "speech-sounds", title: "Speech Sounds", type: "practice"},
              {
                id: "public-speaking",
                title: "Public Speaking Basics",
                type: "quiz",
              },
              {id: "oral-tests", title: "Oral Test Practice", type: "practice"},
              {id: "mock-drills", title: "Mock Oral Drills", type: "test"},
            ],
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
            subLessons: [],
          },
          {
            id: "integers-negatives",
            title: "Working with negative integers",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "fractions-basics",
            title: "Fractions visualization & basic operations",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "decimals-conversion",
            title: "Decimals, percents, & conversions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "factors-multiples",
            title: "Factors, primes, & greatest common divisors",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "intro-variables",
            title: "Introduction to variables & expressions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "combining-like-terms",
            title: "Combining like terms simplifies expressions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "coordinate-plane",
            title: "The coordinate plane & plotting points",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "ratios-rates",
            title: "Ratios, rates, & proportions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "percent-word-probs",
            title: "Percent word problems & growth",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "exponents-intro",
            title: "Exponents & powers of ten",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "square-roots",
            title: "Square roots & perfect squares",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "scientific-notation",
            title: "Scientific notation mechanics",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "basic-geometry",
            title: "Area, perimeter, & volume foundations",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "angles-lines",
            title: "Angles, parallel lines, & transversals",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "linear-inequalities",
            title: "Linear inequalities & interval notation",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "slope-intercept",
            title: "Slope & slope-intercept form",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "graphing-linear",
            title: "Graphing linear equations & functions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "sys-substitution",
            title: "Systems of equations via substitution",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "sys-elimination",
            title: "Systems of equations via elimination",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "exponent-laws",
            title: "Laws of exponents & radical expressions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "quadratics-intro",
            title: "Introduction to factoring quadratics",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "poly-arithmetic",
            title: "Polynomial addition, subtraction, & multiplication",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "poly-division",
            title: "Synthetic & long polynomial division",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "rational-func",
            title: "Graphing rational & radical functions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "unit-circle",
            title: "The unit circle & radian measures",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "trig-functions",
            title: "Sine, cosine, & tangent graphs",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "trig-identities",
            title: "Pythagorean & basic trig identities",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "inverse-trig",
            title: "Inverse trigonometric functions",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "natural-log",
            title: "The natural log & base e",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "exponential-models",
            title: "Solving exponential growth models",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "transformations",
            title: "Function transformations & symmetry",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "piecewise-functions",
            title: "Graphing piecewise & absolute value functions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "matrix-operations",
            title: "Matrix arithmetic & determinants",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "inverse-matrices",
            title: "Solving systems using inverse matrices",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "series-sequences",
            title: "Arithmetic & geometric sequences",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "conditional-prob",
            title: "Conditional probability & independence",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "prob-distributions",
            title: "Binomial probability distributions",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "normal-curve",
            title: "The normal curve & z-scores",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "stats-sampling",
            title: "Sampling methods & bias control",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "stats-inference",
            title: "Confidence intervals & hypothesis testing",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "conic-circles",
            title: "Conic sections: Circles & parabolas",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "conic-ellipses",
            title: "Conic sections: Ellipses & hyperbolas",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "cell-structure",
            title: "Prokaryotic vs. eukaryotic organelles",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "membrane-transport",
            title: "Passive diffusion & active transport pumps",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "osmosis-tonicity",
            title: "Osmosis, tonicity, & hypertonic environments",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "enzymes-catalysis",
            title: "Enzyme kinetics & activation energy",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "glycolysis-krebs",
            title: "Glycolysis & the Krebs cycle",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "electron-transport",
            title: "The electron transport chain & oxidative phosphorylation",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "photosynthesis",
            title: "Light-dependent reactions & Calvin cycle",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "dna-replication",
            title: "DNA replication forks & lagging strands",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "transcription",
            title: "RNA transcription & processing",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "translation",
            title: "Ribosomes & protein translation mechanics",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "mitosis-cycle",
            title: "The cell cycle checkpoints & mitosis steps",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "meiosis-crossing",
            title: "Meiosis & genetic crossing over",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "mendelian-genetics",
            title: "Monohybrid crosses & homozygous profiles",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "non-mendelian",
            title: "Codominance, incomplete dominance, & sex-linked traits",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "isotopes-mass",
            title: "Isotopes & calculating average atomic mass",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "electron-config",
            title: "Electron configurations & orbital diagrams",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "periodic-trends",
            title: "Ionization energy, electronegativity, & atomic radii",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "ionic-bonding",
            title: "Ionic bonding & crystal lattice structures",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "covalent-bonding",
            title: "Covalent bonding & Lewis dot structures",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "molecular-shapes",
            title: "VSEPR theory & 3D molecular structures",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "intermolecular-forces",
            title: "Dipole interactions & hydrogen bonding forces",
            icon: LESSON_ICON,
            subLessons: [],
          },
        ],
      },
      {
        id: "chem-reactions",
        title: "Chemical Reactions & Stoichiometry",
        totalLessons: 6,
        status: "start",
        lessons: [
          {
            id: "reaction-types",
            title: "Reaction types",
            about: {
              intro:
                "Why do chemists sort reactions into categories in the first place? Let's look at the major reaction types and the patterns that help you recognize them.",
              note: "Unit guides are here! Power up your classroom with engaging strategies, tools, and activities from the learning experts.",
            },
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "rt-topic-1",
                type: "topic",
                title: "Overview of reaction types",
                learnItems: [
                  {
                    id: "rt-topic-1-1",
                    title: "What is a chemical reaction?",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "rt-topic-1-2",
                    title: "Signs a reaction has occurred",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "rt-topic-1-3",
                    title: "Reactants and products",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "rt-topic-1-4",
                    title: "Why we classify reactions",
                    src: "",
                    type: "video",
                  },
                ],
              },
              {
                id: "rt-topic-2",
                type: "topic",
                title: "Synthesis & decomposition",
                learnItems: [
                  {
                    id: "rt-topic-2-1",
                    title: "Synthesis reactions",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "rt-topic-2-2",
                    title: "Decomposition reactions",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "rt-topic-2-3",
                    title: "Creativity break: spotting the pattern",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Classify synthesis & decomposition reactions",
                  subtitle: "Get 5 of 7 questions to level up!",
                  upNext: true,
                },
              },
              {
                id: "rt-doc-1",
                type: "doc",
                title: "Explanation: Synthesis & decomposition",
                document: "",
              },
              {
                id: "rt-quiz-1",
                type: "quiz",
                title: "Quiz 1",
                description:
                  "Level up on the above skills and collect up to 240 Mastery points",
              },
              {
                id: "rt-topic-3",
                type: "topic",
                title: "Replacement & combustion",
                learnItems: [
                  {
                    id: "rt-topic-3-1",
                    title: "Single replacement reactions",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "rt-topic-3-2",
                    title: "Double replacement reactions",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "rt-topic-3-3",
                    title: "Combustion reactions",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Identify combustion reactions",
                  subtitle: "Get 5 of 7 questions to level up!",
                },
              },
              {
                id: "rt-test",
                type: "test",
                title: "Unit test",
                description:
                  "Put it all together and see how you've mastered reaction types",
              },
            ],
          },
          {
            id: "balancing-eq",
            title: "Balancing equations",
            about: {
              intro:
                "A chemical equation has to obey the law of conservation of mass. Here we'll build the skills to balance even tricky equations.",
              note: "Unit guides are here! Power up your classroom with engaging strategies, tools, and activities from the learning experts.",
            },
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "be-topic-1",
                type: "topic",
                title: "Basics of balancing",
                learnItems: [
                  {
                    id: "be-topic-1-1",
                    title: "Coefficients vs subscripts",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "be-topic-1-2",
                    title: "Balancing simple equations",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "be-topic-1-3",
                    title: "Balancing with polyatomic ions",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Balance simple equations",
                  subtitle: "Get 5 of 7 questions to level up!",
                  upNext: true,
                },
              },
              {
                id: "be-quiz-1",
                type: "quiz",
                title: "Quiz 1",
                description:
                  "Level up on the above skills and collect up to 240 Mastery points",
              },
              {
                id: "be-topic-2",
                type: "topic",
                title: "Balancing tricky equations",
                learnItems: [
                  {
                    id: "be-topic-2-1",
                    title: "Balancing combustion equations",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "be-topic-2-2",
                    title: "Balancing redox equations",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "be-topic-2-3",
                    title: "Word equations to formulas",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Balance combustion equations",
                  subtitle: "Get 5 of 7 questions to level up!",
                },
              },
              {
                id: "be-test",
                type: "test",
                title: "Unit test",
                description:
                  "Put it all together and see how you've mastered balancing equations",
              },
            ],
          },
          {
            id: "the-mole",
            title: "The mole concept",
            about: {
              intro:
                "How do chemists count atoms too small to see? The mole gives us a bridge between the atomic world and the everyday world.",
              note: "Unit guides are here! Power up your classroom with engaging strategies, tools, and activities from the learning experts.",
            },
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "tm-topic-1",
                type: "topic",
                title: "Introducing the mole",
                learnItems: [
                  {
                    id: "tm-topic-1-1",
                    title: "Avogadro's number",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "tm-topic-1-2",
                    title: "Moles to particles conversions",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Convert moles to particles",
                  subtitle: "Get 5 of 7 questions to level up!",
                  upNext: true,
                },
              },
              {
                id: "tm-test",
                type: "test",
                title: "Unit test",
                description:
                  "Put it all together and see how you've mastered the mole concept",
              },
            ],
          },
          {
            id: "molar-mass-calc",
            title: "Molar mass & empirical formulas",
            about: {
              intro:
                "Once you can find molar mass, a whole world of formula calculations opens up. Let's build that skill and use it to find empirical and molecular formulas.",
              note: "Unit guides are here! Power up your classroom with engaging strategies, tools, and activities from the learning experts.",
            },
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "mm-topic-1",
                type: "topic",
                title: "Calculating molar mass",
                learnItems: [
                  {
                    id: "mm-topic-1-1",
                    title: "Reading the periodic table for mass",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "mm-topic-1-2",
                    title: "Molar mass of compounds",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "mm-topic-1-3",
                    title: "Percent composition",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Calculate molar mass of compounds",
                  subtitle: "Get 5 of 7 questions to level up!",
                  upNext: true,
                },
              },
              {
                id: "mm-quiz-1",
                type: "quiz",
                title: "Quiz 1",
                description:
                  "Level up on the above skills and collect up to 240 Mastery points",
              },
              {
                id: "mm-topic-2",
                type: "topic",
                title: "Empirical & molecular formulas",
                learnItems: [
                  {
                    id: "mm-topic-2-1",
                    title: "Finding empirical formulas",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "mm-topic-2-2",
                    title: "Molecular vs empirical formulas",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "mm-topic-2-3",
                    title: "Hydrates",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Find empirical formulas",
                  subtitle: "Get 5 of 7 questions to level up!",
                },
              },
              {
                id: "mm-test",
                type: "test",
                title: "Unit test",
                description:
                  "Put it all together and see how you've mastered molar mass & formulas",
              },
            ],
          },
          {
            id: "stoichiometry-mass",
            title: "Mass-to-mass stoichiometry",
            about: {
              intro:
                "Balanced equations aren't just symbols — they're recipes. Here we'll use mole ratios to predict exactly how much product a reaction makes.",
              note: "Unit guides are here! Power up your classroom with engaging strategies, tools, and activities from the learning experts.",
            },
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "sm-topic-1",
                type: "topic",
                title: "Mole ratios",
                learnItems: [
                  {
                    id: "sm-topic-1-1",
                    title: "Mole ratios from equations",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "sm-topic-1-2",
                    title: "Mole-to-mole conversions",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Use mole ratios",
                  subtitle: "Get 5 of 7 questions to level up!",
                  upNext: true,
                },
              },
              {
                id: "sm-topic-2",
                type: "topic",
                title: "Mass-to-mass conversions",
                learnItems: [
                  {
                    id: "sm-topic-2-1",
                    title: "Mass-to-mole conversions",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "sm-topic-2-2",
                    title: "Mass-to-mass conversions",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Solve mass-to-mass problems",
                  subtitle: "Get 5 of 7 questions to level up!",
                },
              },
              {
                id: "sm-test",
                type: "test",
                title: "Unit test",
                description:
                  "Put it all together and see how you've mastered stoichiometry",
              },
            ],
          },
          {
            id: "limiting-reactants",
            title: "Limiting reactants & yield",
            about: {
              intro:
                "In real reactions, one reactant usually runs out first. Let's learn to spot it and use it to predict theoretical and percent yield.",
              note: "Unit guides are here! Power up your classroom with engaging strategies, tools, and activities from the learning experts.",
            },
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "lr-topic-1",
                type: "topic",
                title: "Finding the limiting reactant",
                learnItems: [
                  {
                    id: "lr-topic-1-1",
                    title: "What is a limiting reactant?",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "lr-topic-1-2",
                    title: "Finding the limiting reactant",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "lr-topic-1-3",
                    title: "Excess reactant amounts",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Identify the limiting reactant",
                  subtitle: "Get 5 of 7 questions to level up!",
                  upNext: true,
                },
              },
              {
                id: "lr-quiz-1",
                type: "quiz",
                title: "Quiz 1",
                description:
                  "Level up on the above skills and collect up to 240 Mastery points",
              },
              {
                id: "lr-topic-2",
                type: "topic",
                title: "Yield",
                learnItems: [
                  {
                    id: "lr-topic-2-1",
                    title: "Theoretical yield",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "lr-topic-2-2",
                    title: "Actual vs theoretical yield",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "lr-topic-2-3",
                    title: "Percent yield",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Calculate percent yield",
                  subtitle: "Get 5 of 7 questions to level up!",
                },
              },
              {
                id: "lr-test",
                type: "test",
                title: "Unit test",
                description:
                  "Put it all together and see how you've mastered limiting reactants & yield",
              },
            ],
          },
          {
            id: "solutions-molarity",
            title: "Molarity & dilutions",
            about: {
              intro:
                "Most reactions in a lab happen in solution. Molarity gives us a precise way to describe and prepare those solutions.",
              note: "Unit guides are here! Power up your classroom with engaging strategies, tools, and activities from the learning experts.",
            },
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "so-topic-1",
                type: "topic",
                title: "Molarity",
                learnItems: [
                  {
                    id: "so-topic-1-1",
                    title: "What is molarity?",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "so-topic-1-2",
                    title: "Calculating molarity",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "so-topic-1-3",
                    title: "Preparing solutions",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Calculate molarity",
                  subtitle: "Get 5 of 7 questions to level up!",
                  upNext: true,
                },
              },
              {
                id: "so-topic-2",
                type: "topic",
                title: "Dilutions",
                learnItems: [
                  {
                    id: "so-topic-2-1",
                    title: "Dilution calculations",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Solve dilution problems",
                  subtitle: "Get 5 of 7 questions to level up!",
                },
              },
              {
                id: "so-test",
                type: "test",
                title: "Unit test",
                description:
                  "Put it all together and see how you've mastered molarity & dilutions",
              },
            ],
          },
          {
            id: "gas-laws",
            title: "Ideal gas laws",
            about: {
              intro:
                "Gases behave in wonderfully predictable ways. We'll connect pressure, volume, and temperature — then bring stoichiometry into the mix.",
              note: "Unit guides are here! Power up your classroom with engaging strategies, tools, and activities from the learning experts.",
            },
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "gl-topic-1",
                type: "topic",
                title: "Gas law fundamentals",
                learnItems: [
                  {
                    id: "gl-topic-1-1",
                    title: "Properties of gases",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "gl-topic-1-2",
                    title: "Boyle's & Charles's laws",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "gl-topic-1-3",
                    title: "The combined gas law",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "gl-topic-1-4",
                    title: "The ideal gas law",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Apply the ideal gas law",
                  subtitle: "Get 5 of 7 questions to level up!",
                  upNext: true,
                },
              },
              {
                id: "gl-quiz-1",
                type: "quiz",
                title: "Quiz 1",
                description:
                  "Level up on the above skills and collect up to 240 Mastery points",
              },
              {
                id: "gl-topic-2",
                type: "topic",
                title: "Gas stoichiometry",
                learnItems: [
                  {
                    id: "gl-topic-2-1",
                    title: "STP and molar volume",
                    src: "",
                    type: "video",
                  },
                  {
                    id: "gl-topic-2-2",
                    title: "Gas stoichiometry",
                    src: "",
                    type: "video",
                  },
                ],
                practice: {
                  title: "Solve gas stoichiometry problems",
                  subtitle: "Get 5 of 7 questions to level up!",
                },
              },
              {
                id: "gl-test",
                type: "test",
                title: "Unit test",
                description:
                  "Put it all together and see how you've mastered gas laws",
              },
            ],
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
            subLessons: [],
          },
          {
            id: "middle-english",
            title: "Middle English romance & Chaucer's influence",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "renaissance-poetry",
            title: "Renaissance lyric poetry & sonnet forms",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "shakespeare-origins",
            title: "Shakespeare's dramatic influences",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "poetry-terms",
            title: "Figurative language in poetry",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "verse-forms",
            title: "Meter, rhyme, & verse structures",
            icon: LESSON_ICON,
            subLessons: [],
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
            subLessons: [],
          },
          {
            id: "18th-century-novel",
            title: "18th-century realism & character development",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "19th-century-novel",
            title: "Victorian novels & social critique",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "modernist-novel",
            title:
              "Modernism, stream of consciousness, & fragmented narratives",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "postcolonial-novel",
            title: "Postcolonial narratives & identity themes",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "prose-fiction-analysis",
            title: "Characterization, setting, & narrative voice",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "satire-humor",
            title: "Satire, irony, & comic devices",
            icon: LESSON_ICON,
            subLessons: [],
          },
          {
            id: "plot-structure",
            title: "Story structure & plot devices",
            icon: LESSON_ICON,
            subLessons: [],
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
