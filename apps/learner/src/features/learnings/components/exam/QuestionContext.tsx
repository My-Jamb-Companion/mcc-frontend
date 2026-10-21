import MarkedText from "./MarkedText";

/**
 * What goes with a question in a long-text paper: its directions, and the reading passage it refers to. A passage can
 * be long, so it scrolls inside its own box rather than pushing the question off the screen.
 */
export default function QuestionContext({instruction, passage}: {instruction?: string | null; passage?: string | null}) {
  if (!instruction?.trim() && !passage?.trim()) return null;
  return (
    <div className="mb-4 flex flex-col gap-3">
      {instruction?.trim() && (
        <p className="rounded-lg bg-primary/5 px-3 py-2 text-sm font-medium leading-relaxed text-primary">
          <MarkedText text={instruction} />
        </p>
      )}
      {passage?.trim() && (
        <section aria-label="Passage" className="rounded-xl border border-muted/20 bg-muted/5">
          <p className="border-b border-muted/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-subtle">Passage</p>
          <div className="max-h-72 overflow-y-auto px-4 py-3 text-sm leading-relaxed lg:max-h-[24rem]" tabIndex={0}>
            <MarkedText text={passage} />
          </div>
        </section>
      )}
    </div>
  );
}
