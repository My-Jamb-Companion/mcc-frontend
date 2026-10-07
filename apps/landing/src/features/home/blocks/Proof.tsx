import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { DISPLAY, Intro, Section } from "../ui";

export function Proof({ data, blockId }: { data: FieldData; blockId: string }) {
  const quotes = list(data, "quotes");
  const results = list(data, "results");
  return (
    <Section id="stories" blockId={blockId} background="#fff" gap={36}>
      <Intro eyebrow={str(data, "eyebrow")} headline={str(data, "headline")} />
      {quotes.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 20 }}>
          {quotes.map((q, i) => (
            <figure key={i} style={{ margin: 0, padding: 28, borderRadius: 28, border: "1px solid #EEE8FB", background: "#FAF8FF", display: "flex", flexDirection: "column", gap: 22 }}>
              <span aria-hidden="true" style={{ fontFamily: DISPLAY, fontSize: 56, lineHeight: 0.6, color: "#B9A6E8", height: 28 }}>“</span>
              <blockquote style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: "#404040", flex: 1 }}>{str(q, "text")}</blockquote>
              <figcaption style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: "50%", background: "#EADFFF", color: "#4F0FB0", display: "grid", placeItems: "center", fontWeight: 700, flex: "none" }}>{str(q, "who").charAt(0).toUpperCase()}</span>
                <span><span style={{ display: "block", fontWeight: 700, fontSize: 15, color: "#262626" }}>{str(q, "who")}</span><span style={{ display: "block", fontSize: 13, color: "#5C5C5C" }}>{str(q, "meta")}</span></span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {results.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 12 }}>
          {results.map((r, i) => (
            <div key={i} style={{ padding: 22, borderRadius: 22, background: "#F6F1FF", display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 32, lineHeight: 1, color: "#4F0FB0" }}>{str(r, "value")}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#404040" }}>{str(r, "label")}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
