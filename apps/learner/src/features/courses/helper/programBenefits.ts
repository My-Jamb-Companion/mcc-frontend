import type {ApiFormatOffer, LiveFormat} from "./liveFormats";

export type ProgramKind = "course" | "exam";

/** The numbers a buyer weighs up first, for the way of learning they have picked. */
export interface ProgramFact {
  label: string;
  value: string;
  /** A smaller line under the value. */
  note?: string;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
const hoursText = (h: number) => `${Number.isInteger(h) ? h : h.toFixed(1)} ${h === 1 ? "hour" : "hours"}`;

/**
 * Duration, live sessions and class size for the chosen format, as the admin entered them. A fact the admin has
 * not entered yet (weeks on an older program) is left out rather than guessed.
 */
export function programFacts(offer: ApiFormatOffer | undefined, format: LiveFormat | null): ProgramFact[] {
  if (!offer) return [];
  const facts: ProgramFact[] = [];
  const weeks = Number(offer.duration_weeks);
  if (Number.isFinite(weeks) && weeks > 0) facts.push({label: "Duration", value: plural(weeks, "week")});

  const sessions = Number(offer.live_sessions ?? 0);
  const hours = Number(offer.hours_per_session ?? 0);
  if (format === "self_paced" || sessions < 1) {
    facts.push({label: "Live sessions", value: "None", note: "Learn at your own pace"});
  } else {
    const total = sessions * hours;
    facts.push({
      label: "Live sessions",
      value: String(sessions),
      note: hours > 0 ? `${hoursText(hours)} each, ${hoursText(total)} in all` : undefined,
    });
    facts.push({
      label: "Class size",
      value: offer.seats <= 1 ? "Just you" : `Up to ${offer.seats}`,
      note: offer.seats <= 1 ? "1-to-1 with your Tutor" : "students with 1 Tutor",
    });
  }
  return facts;
}

/**
 * Everything that comes with enrolling, for the kind of program and the way of learning picked. Only things the
 * app really provides: nothing here needs to change when prices do.
 */
export function programBenefits(kind: ProgramKind, format: LiveFormat | null, offer?: ApiFormatOffer): string[] {
  const live: string[] = [];
  const sessions = Number(offer?.live_sessions ?? 0);
  if (format === "group" && sessions > 0) {
    live.push(`${plural(sessions, "live class", "live classes")} with your Tutor and up to ${(offer?.seats ?? 5) - 1} other students`);
  } else if (format === "one_to_one" && sessions > 0) {
    live.push(`${plural(sessions, "live class", "live classes")} with a Tutor just for you`);
  }

  const learning =
    kind === "exam"
      ? [
          "Unlimited access to every lesson, for as long as you need it",
          "Unlimited practice, Smart Zone and mock exams",
          "A readiness score that shows how prepared you are for the exam",
        ]
      : [
          "Unlimited access to every lesson, for as long as you need it",
          "Unlimited practice and module quizzes",
          "Take notes and bookmark lessons as you learn",
        ];

  const support =
    kind === "exam"
      ? []
      : [
          "Ask your Tutor when you are stuck",
        ];

  return [
    ...learning,
    ...live,
    "Unlimited study sets and flashcards",
    "Brainy, your AI study companion, to explain, quiz and coach you",
    ...support,
    "Community Q&A to learn alongside other students",
    "Track your progress and see where to focus next",
    "Earn points, gems, streaks and badges, and climb the leaderboard",
    "A certificate when you complete it",
    "A free onboarding call with a learning coordinator",
    "Learn on your phone, tablet or computer",
  ];
}
