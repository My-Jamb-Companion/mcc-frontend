import {splitUnderlined} from "@/src/features/learnings/helper/markedText";

/** Text where __this__ is shown underlined, as the underlined portion of a past-paper question. Line breaks are kept. */
export default function MarkedText({text, className}: {text: string; className?: string}) {
  return (
    <span className={`whitespace-pre-line ${className ?? ""}`}>
      {splitUnderlined(text).map((part, i) =>
        part.underline ? (
          <u key={i} className="underline decoration-2 underline-offset-2">{part.text}</u>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}
