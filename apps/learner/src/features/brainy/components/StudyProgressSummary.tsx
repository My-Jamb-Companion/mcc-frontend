import type {ProgressCounts} from "../services/flashcards.service";

const TILES: {key: keyof Omit<ProgressCounts, "total">; label: string; tone: string}[] = [
  {key: "new", label: "New", tone: "text-foreground"},
  {key: "learning", label: "Learning", tone: "text-amber-600"},
  {key: "mastered", label: "Mastered", tone: "text-green-600"},
  {key: "due", label: "Due now", tone: "text-purple-600"},
];

/** New / Learning / Mastered / Due tiles plus a mastered bar, from the server's summary. */
export default function StudyProgressSummary({summary}: {summary: ProgressCounts}) {
  const percent = summary.total ? Math.round((summary.mastered / summary.total) * 100) : 0;
  return (
    <section aria-label="Study progress" className="rounded-2xl border border-muted/20 p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TILES.map((t) => (
          <div key={t.key}>
            <p className={`text-2xl font-semibold ${t.tone}`}>{summary[t.key]}</p>
            <p className="text-xs text-muted">{t.label}</p>
          </div>
        ))}
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-muted/15"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Mastered"
      >
        <div className="h-full rounded-full bg-green-500 transition-all" style={{width: `${percent}%`}} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {summary.mastered} of {summary.total} cards mastered
      </p>
    </section>
  );
}
