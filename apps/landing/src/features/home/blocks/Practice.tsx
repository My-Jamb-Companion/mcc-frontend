import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { Button, DISPLAY, Eyebrow, H2, Lead } from "../ui";

const option = { display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 14, border: "1.5px solid #E7E2F3" };
const letter = { width: 24, height: 24, borderRadius: 8, background: "#F5F3F8", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 };

function QuizMockup() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460, display: "flex", justifyContent: "center", paddingBottom: 40 }} aria-hidden="true">
      <div style={{ position: "absolute", inset: "6% 4% 14%", borderRadius: 48, background: "#F4EFFF", transform: "rotate(-4deg)" }} />
      <div style={{ position: "relative", width: "min(290px,88%)", borderRadius: 44, background: "#0A0A0A", padding: 9, boxShadow: "0 30px 60px -24px rgba(60,20,140,.45)" }}>
        <div style={{ borderRadius: 36, background: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", fontSize: 13, padding: "18px 14px 16px", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#6717DE" }}>JAMB MATHS · MOCK 2</div>
              <div style={{ fontSize: 12, color: "#5C5C5C", marginTop: 2 }}>Question 7 of 40</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, background: "#171717", color: "#fff", fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>18:42
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: "#EEE8FB", overflow: "hidden" }}><div style={{ width: "17.5%", height: "100%", background: "#6B26FF" }} /></div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, padding: "4px 2px" }}>If 2x + 3 = 11, what is the value of x?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={option}><span style={letter}>A</span>3</div>
            <div style={{ ...option, border: "2px solid #16A34A", background: "#ECFDF3", fontWeight: 700, color: "#0F5B2E" }}>
              <span style={{ ...letter, background: "#16A34A", color: "#fff" }}>B</span>4<span style={{ marginLeft: "auto", fontSize: 11 }}>Correct</span>
            </div>
            <div style={option}><span style={letter}>C</span>5</div>
            <div style={option}><span style={letter}>D</span>7</div>
          </div>
          <div style={{ padding: 12, borderRadius: 14, background: "#F4EFFF", lineHeight: 1.5, color: "#2B1A4F" }}><b style={{ color: "#4F0FB0" }}>Why B?</b> Take 3 from both sides: 2x = 8. Divide both sides by 2: x = 4.</div>
          <div style={{ padding: 12, borderRadius: 999, background: "#6717DE", color: "#fff", fontWeight: 700, textAlign: "center" }}>Next question</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 18, background: "#fff", boxShadow: "0 18px 36px -16px rgba(40,10,100,.4)", fontSize: 13 }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", background: "conic-gradient(#6B26FF 0 60%,#EEE8FB 60% 100%)", display: "grid", placeItems: "center" }}><span style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff" }} /></span>
        <span><span style={{ display: "block", fontWeight: 700 }}>Module 3 test</span><span style={{ display: "block", color: "#5C5C5C", fontSize: 12 }}>Pass mark 60%</span></span>
      </div>
    </div>
  );
}

export function Practice({ data, blockId }: { data: FieldData; blockId: string }) {
  const features = list(data, "features");
  return (
    <section id="practice" data-block-id={blockId} style={{ containerType: "inline-size", background: "#fff", color: "#171717", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(64px,8cqw,112px) clamp(20px,5cqw,56px)", display: "flex", flexDirection: "row-reverse", flexWrap: "wrap", alignItems: "center", gap: "clamp(48px,6cqw,80px)" }}>
        <div style={{ flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
          <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
          <H2>{str(data, "headline")}</H2>
          <Lead maxWidth={520}>{str(data, "body")}</Lead>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 520 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: "flex", gap: 16, padding: 18, borderRadius: 20, background: "#FAF8FF", border: "1px solid #EEE8FB" }}>
                <span style={{ width: 44, height: 44, flex: "none", borderRadius: 14, background: "#fff", color: "#6717DE", display: "grid", placeItems: "center", fontFamily: DISPLAY, fontSize: 20, boxShadow: "0 1px 0 #E7E2F3" }}>{i + 1}</span>
                <span><span style={{ display: "block", fontSize: 17, fontWeight: 700 }}>{str(f, "title")}</span><span style={{ display: "block", fontSize: 15, lineHeight: 1.55, color: "#4A4A4A", marginTop: 2 }}>{str(f, "body")}</span></span>
              </li>
            ))}
          </ul>
          {str(data, "cta_label") && <Button href={str(data, "cta_href")} arrow>{str(data, "cta_label")}</Button>}
        </div>
        <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", justifyContent: "center" }}>
          <QuizMockup />
        </div>
      </div>
    </section>
  );
}
