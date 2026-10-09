/**
 * The text of the About page. It only says what the platform actually does today; company history,
 * team and numbers are deliberately left out until someone supplies them.
 */
export type CompanySection = { heading: string; paragraphs?: string[]; bullets?: string[] };

export const ABOUT = {
  title: "About My Course Companion",
  summary: "A learning platform made in Nigeria: exam preparation, courses, live classes with real teachers, and an AI study companion, in one place.",
  sections: [
    {
      heading: "What we do",
      paragraphs: [
        "My Course Companion (MCC) helps students prepare for the exams that decide their next step, and pick up new skills along the way. Everything a student needs sits in one account: lessons to learn from, practice to test themselves, teachers to ask, and a study companion that is there when they are stuck.",
      ],
    },
    {
      heading: "What you will find",
      bullets: [
        "Exam prep for JAMB, WAEC, NECO, IGCSE and more, with lessons, quizzes, practice tests and mock exams.",
        "Courses for new skills, with lessons you can take at your own pace and certificates when you finish.",
        "Live classes with real teachers, including a weekly one-to-one session once you are matched with a teacher.",
        "Brainy, our AI study companion, which answers questions, explains topics and turns your notes into flashcards.",
        "Goals, streaks, points, badges and levels that make showing up every day easier.",
      ],
    },
    {
      heading: "For parents",
      paragraphs: [
        "Parents can create an account together with their child's, follow their progress, see upcoming classes and the teachers they are working with, and pay for courses and exam prep, with a receipt for every payment.",
      ],
    },
    {
      heading: "For teachers",
      paragraphs: [
        "Teachers apply to join MCC, are verified before they start, and are paid for the sessions they teach. If you would like to teach with us, you can apply from the teacher app.",
      ],
    },
    {
      heading: "A course coordinator on your side",
      paragraphs: [
        "When a student enrols, a course coordinator holds a short onboarding call to understand their goals, then matches them with the right teacher. Students can message their coordinator at any time while they get started.",
      ],
    },
  ] satisfies CompanySection[],
};

export const CONTACT = {
  title: "Contact us",
  summary: "Questions about an account, a payment or teaching with us? Here is how to reach us.",
};
