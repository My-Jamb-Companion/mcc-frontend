import { bool, list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { Button, DISPLAY, Intro, Section } from "../ui";

export function Steps({ data, blockId }: { data: FieldData; blockId: string }) {
  const steps = list(data, "steps");
  return (
    <Section id="how" blockId={blockId} background="#fff" gap={40}>
      <Intro eyebrow={str(data, "eyebrow")} headline={str(data, "headline")} body={str(data, "body")} />
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,236px),1fr))", gap: 16 }}>
        {steps.map((s, i) => {
          const hi = bool(s, "highlight");
          return (
            <li key={i} style={{ display: "flex", flexDirection: "column", gap: 16, padding: "28px 24px", borderRadius: 28, background: hi ? "#6717DE" : "#F6F1FF", color: hi ? "#fff" : undefined }}>
              <span style={{ width: 56, height: 56, borderRadius: 18, background: "#fff", color: "#6717DE", display: "grid", placeItems: "center", fontFamily: DISPLAY, fontSize: 28 }}>{i + 1}</span>
              {hi && <span style={{ display: "inline-flex", alignSelf: "flex-start", padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.18)", fontSize: 12, fontWeight: 700, letterSpacing: ".04em" }}>FREE · A REAL PERSON</span>}
              <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.25, fontWeight: 700 }}>{str(s, "title")}</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: hi ? "#F1EBFF" : "#4A4A4A" }}>{str(s, "body")}</p>
            </li>
          );
        })}
      </ol>
      {str(data, "cta_label") && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}>
          <Button href={str(data, "cta_href")} arrow>{str(data, "cta_label")}</Button>
          <span style={{ fontSize: 15, color: "#525252" }}>{str(data, "note")}</span>
        </div>
      )}
    </Section>
  );
}
