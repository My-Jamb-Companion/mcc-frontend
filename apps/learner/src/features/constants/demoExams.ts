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

export interface ExamLesson {
  id: string;
  title: string;
  icon: string;
  subLessons: {
    id: string;
    title: string;
    type: "practice" | "quiz" | "test";
  }[];
}

export interface ExamUnit {
  id: string;
  title: string;
  totalLessons: number;
  status: "resume" | "start";
  lessons: ExamLesson[];
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
        totalLessons: 8,
        status: "start",
        lessons: [
          {
            id: "reaction-types",
            title: "Synthesis, decomposition, & combustion reactions",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "rt-1",
                type: "practice",
                title: "What is a chemical reaction?",
              },
              {id: "rt-2", type: "practice", title: "Synthesis reactions"},
              {
                id: "rt-3",
                type: "quiz",
                title: "Checkpoint: synthesis & decomposition",
              },
              {id: "rt-4", type: "practice", title: "Decomposition reactions"},
              {
                id: "rt-5",
                type: "practice",
                title: "Single replacement reactions",
              },
              {
                id: "rt-6",
                type: "practice",
                title: "Double replacement reactions",
              },
              {id: "rt-7", type: "practice", title: "Combustion reactions"},
              {id: "rt-8", type: "quiz", title: "Checkpoint: reaction types"},
              {id: "rt-9", type: "test", title: "Unit test: reaction types"},
            ],
          },
          {
            id: "balancing-eq",
            title: "Balancing complex chemical equations",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "be-1",
                type: "practice",
                title: "Why equations must balance",
              },
              {
                id: "be-2",
                type: "practice",
                title: "Coefficients vs subscripts",
              },
              {
                id: "be-3",
                type: "practice",
                title: "Balancing simple equations",
              },
              {
                id: "be-4",
                type: "practice",
                title: "Balancing with polyatomic ions",
              },
              {id: "be-5", type: "quiz", title: "Checkpoint: basic balancing"},
              {
                id: "be-6",
                type: "practice",
                title: "Balancing combustion equations",
              },
              {
                id: "be-7",
                type: "practice",
                title: "Balancing redox equations",
              },
              {
                id: "be-8",
                type: "quiz",
                title: "Checkpoint: complex balancing",
              },
              {
                id: "be-9",
                type: "practice",
                title: "Word equations to formulas",
              },
              {id: "be-10", type: "quiz", title: "Checkpoint: word equations"},
              {
                id: "be-11",
                type: "test",
                title: "Unit test: balancing equations",
              },
            ],
          },
          {
            id: "the-mole",
            title: "Avogadro's number & the mole concept",
            icon: LESSON_ICON,
            subLessons: [
              {id: "tm-1", type: "practice", title: "Introducing the mole"},
              {id: "tm-2", type: "practice", title: "Avogadro's number"},
              {
                id: "tm-3",
                type: "practice",
                title: "Moles to particles conversions",
              },
              {
                id: "tm-4",
                type: "practice",
                title: "Moles to mass conversions",
              },
              {id: "tm-5", type: "test", title: "Unit test: the mole concept"},
            ],
          },
          {
            id: "molar-mass-calc",
            title: "Calculating molar mass & empirical formulas",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "mm-1",
                type: "practice",
                title: "Reading the periodic table for mass",
              },
              {id: "mm-2", type: "practice", title: "Calculating molar mass"},
              {id: "mm-3", type: "practice", title: "Molar mass of compounds"},
              {id: "mm-4", type: "practice", title: "Percent composition"},
              {id: "mm-5", type: "practice", title: "Empirical formula basics"},
              {
                id: "mm-6",
                type: "practice",
                title: "Finding empirical formulas",
              },
              {id: "mm-7", type: "quiz", title: "Checkpoint: molar mass"},
              {
                id: "mm-8",
                type: "practice",
                title: "Molecular vs empirical formulas",
              },
              {
                id: "mm-9",
                type: "practice",
                title: "Finding molecular formulas",
              },
              {
                id: "mm-10",
                type: "practice",
                title: "Hydrates and water of crystallization",
              },
              {
                id: "mm-11",
                type: "practice",
                title: "Combustion analysis basics",
              },
              {
                id: "mm-12",
                type: "practice",
                title: "Practice: empirical formulas",
              },
              {
                id: "mm-13",
                type: "practice",
                title: "Practice: molecular formulas",
              },
              {
                id: "mm-14",
                type: "quiz",
                title: "Checkpoint: empirical formulas",
              },
              {
                id: "mm-15",
                type: "test",
                title: "Unit test: molar mass & formulas",
              },
            ],
          },
          {
            id: "stoichiometry-mass",
            title: "Mass-to-mass stoichiometry calculations",
            icon: LESSON_ICON,
            subLessons: [
              {id: "sm-1", type: "practice", title: "What is stoichiometry?"},
              {
                id: "sm-2",
                type: "practice",
                title: "Mole ratios from equations",
              },
              {id: "sm-3", type: "practice", title: "Mole-to-mole conversions"},
              {id: "sm-4", type: "quiz", title: "Checkpoint: mole ratios"},
              {id: "sm-5", type: "practice", title: "Mass-to-mole conversions"},
              {id: "sm-6", type: "practice", title: "Mass-to-mass conversions"},
              {id: "sm-7", type: "quiz", title: "Checkpoint: mass-to-mass"},
              {id: "sm-8", type: "test", title: "Unit test: stoichiometry"},
            ],
          },
          {
            id: "limiting-reactants",
            title: "Identifying limiting reactants & theoretical yield",
            icon: LESSON_ICON,
            subLessons: [
              {
                id: "lr-1",
                type: "practice",
                title: "What is a limiting reactant?",
              },
              {
                id: "lr-2",
                type: "practice",
                title: "Finding the limiting reactant",
              },
              {id: "lr-3", type: "practice", title: "Excess reactant amounts"},
              {id: "lr-4", type: "practice", title: "Theoretical yield"},
              {
                id: "lr-5",
                type: "quiz",
                title: "Checkpoint: limiting reactants",
              },
              {
                id: "lr-6",
                type: "practice",
                title: "Actual yield vs theoretical yield",
              },
              {id: "lr-7", type: "practice", title: "Percent yield"},
              {
                id: "lr-8",
                type: "test",
                title: "Unit test: limiting reactants & yield",
              },
            ],
          },
          {
            id: "solutions-molarity",
            title: "Molarity concentration & solution dilutions",
            icon: LESSON_ICON,
            subLessons: [
              {id: "so-1", type: "practice", title: "What is molarity?"},
              {id: "so-2", type: "practice", title: "Calculating molarity"},
              {id: "so-3", type: "practice", title: "Preparing solutions"},
              {id: "so-4", type: "quiz", title: "Checkpoint: molarity"},
              {id: "so-5", type: "practice", title: "Dilution calculations"},
              {
                id: "so-6",
                type: "test",
                title: "Unit test: solutions & molarity",
              },
            ],
          },
          {
            id: "gas-laws",
            title: "Ideal gas laws & gas stoichiometry",
            icon: LESSON_ICON,
            subLessons: [
              {id: "gl-1", type: "practice", title: "Properties of gases"},
              {id: "gl-2", type: "practice", title: "Boyle's & Charles's laws"},
              {id: "gl-3", type: "practice", title: "The combined gas law"},
              {id: "gl-4", type: "practice", title: "The ideal gas law"},
              {id: "gl-5", type: "practice", title: "STP and molar volume"},
              {id: "gl-6", type: "quiz", title: "Checkpoint: gas laws"},
              {id: "gl-7", type: "practice", title: "Gas stoichiometry"},
              {
                id: "gl-8",
                type: "quiz",
                title: "Checkpoint: gas stoichiometry",
              },
              {id: "gl-9", type: "test", title: "Unit test: gas laws"},
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
    currency: "â‚¦",
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
