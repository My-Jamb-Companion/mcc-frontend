import type { CatalogueFormat, LiveFormat } from "./formats";

export type ProgramKind = "course" | "exam";

/** The numbers a parent weighs up first, for the way of learning picked. */
export interface ProgramFact {
  label: string;
  value: string;
  note?: string;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
const hoursText = (h: number) => `${Number.isInteger(h) ? h : h.toFixed(1)} ${h === 1 ? "hour" : "hours"}`;

/**
 * Duration, live sessions and class size for the chosen format, as the admin entered them. A fact the admin has
 * not entered yet (weeks on an older program) is left out rather than guessed.
 */
export function programFacts(offer: CatalogueFormat | undefined, format: LiveFormat | undefined): ProgramFact[] {
  if (!offer) return [];
  const facts: ProgramFact[] = [];
  const weeks = Number(offer.duration_weeks);
  if (Number.isFinite(weeks) && weeks > 0) facts.push({ label: "Duration", value: plural(weeks, "week") });

  const sessions = Number(offer.live_sessions ?? 0);
  const hours = Number(offer.hours_per_session ?? 0);
  if (format === "self_paced" || sessions < 1) {
    facts.push({ label: "Live sessions", value: "None", note: "Learns at their own pace" });
  } else {
    facts.push({
      label: "Live sessions",
      value: String(sessions),
      note: hours > 0 ? `${hoursText(hours)} each, ${hoursText(sessions * hours)} in all` : undefined,
    });
    facts.push({
      label: "Class size",
      value: offer.seats <= 1 ? "Just your child" : `Up to ${offer.seats}`,
      note: offer.seats <= 1 ? "1-to-1 with their Tutor" : "students with 1 Tutor",
    });
  }
  return facts;
}

/** Everything that comes with enrolling, for the kind of program and the way of learning picked. */
export function programBenefits(kind: ProgramKind, format: LiveFormat | undefined, offer?: CatalogueFormat): string[] {
  const live: string[] = [];
  const sessions = Number(offer?.live_sessions ?? 0);
  if (format === "group" && sessions > 0) {
    live.push(`${plural(sessions, "live class", "live classes")} with their Tutor and up to ${(offer?.seats ?? 5) - 1} other students`);
  } else if (format === "one_to_one" && sessions > 0) {
    live.push(`${plural(sessions, "live class", "live classes")} with a Tutor just for your child`);
  }

  const learning =
    kind === "exam"
      ? [
          "Unlimited access to every lesson, for as long as they need it",
          "Unlimited practice, Smart Zone and mock exams",
          "A readiness score that shows how prepared they are for the exam",
        ]
      : [
          "Unlimited access to every lesson, for as long as they need it",
          "Unlimited practice and module quizzes",
          "Notes and bookmarks to help them revise",
        ];

  return [
    ...learning,
    ...live,
    "Unlimited study sets and flashcards",
    "Brainy, an AI study companion that explains, quizzes and coaches",
    ...(kind === "course" ? ["A Tutor they can ask when they are stuck"] : []),
    "Community Q&A to learn alongside other students",
    "A monthly progress report for you, and their progress in this portal any time",
    "Points, gems, streaks and badges that keep them motivated",
    "A certificate when they complete it",
    "A free onboarding call with a learning coordinator",
    "Works on a phone, tablet or computer",
  ];
}
