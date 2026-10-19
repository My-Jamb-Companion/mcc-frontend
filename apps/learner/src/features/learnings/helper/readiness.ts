import type {
  ApiPredictedScore,
  ApiReadinessTile,
  ReadinessLevel,
} from "@/src/features/exams/services/exam.service";

export const LEVEL_ORDER: ReadinessLevel[] = ["ready", "proficient", "familiar", "attempted", "not_started"];

export const LEVEL_LABEL: Record<ReadinessLevel, string> = {
  ready: "Ready",
  proficient: "Proficient",
  familiar: "Familiar",
  attempted: "Attempted",
  not_started: "Not started",
};

/** Tile colours per level: empty until played, then orange, green, purple, and purple with a crown. */
export const LEVEL_STYLE: Record<ReadinessLevel, string> = {
  not_started: "border border-muted/40 bg-transparent",
  attempted: "bg-orange-400",
  familiar: "bg-green-600",
  proficient: "bg-primary",
  ready: "bg-primary-gradient",
};

/** "62% – 71%", or null when there is no range yet. */
export function predictedRange(predicted: ApiPredictedScore): string | null {
  if (!predicted.available || predicted.low === null || predicted.high === null) return null;
  return predicted.low === predicted.high ? `${predicted.low}%` : `${predicted.low}% – ${predicted.high}%`;
}

const CONFIDENCE: Record<string, string> = {
  low: "Early estimate: it will firm up as you answer more.",
  medium: "A fair estimate from what you've answered so far.",
  high: "A solid estimate: you've covered a lot of the program.",
};

export const confidenceNote = (predicted: ApiPredictedScore): string | null =>
  predicted.confidence ? CONFIDENCE[predicted.confidence] ?? null : null;

/** "3 of 7 played" for a tile's tooltip. */
export const tileSummary = (tile: ApiReadinessTile): string =>
  `${tile.title}: ${LEVEL_LABEL[tile.level]}${tile.total ? ` (${tile.answered} of ${tile.total} questions played)` : ""}`;

/** "Leveled up on 2 topics", or null when nothing moved. */
export function leveledUpText(count: number): string | null {
  return count > 0 ? `Leveled up on ${count} topic${count === 1 ? "" : "s"}` : null;
}
