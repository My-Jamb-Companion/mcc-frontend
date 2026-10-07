import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Button, DISPLAY, Lead, H2 } from "../ui";

function ParentPhone() {
  const bars = [40, 70, 55, 90, 30, 65, 20];
  return (
    <div style={{ position: "relative", width: "min(290px,88%)", borderRadius: 44, background: "#0A0A0A", padding: 9, boxShadow: "0 30px 60px -24px rgba(60,20,140,.45)" }} aria-hidden="true">
      <div style={{ borderRadius: 36, background: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", fontSize: 13, padding: "20px 14px 16px", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#6717DE" }}>PARENT APP</span><span style={{ fontSize: 11, color: "#5C5C5C" }}>This week</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: "50%", background: "#EADFFF", color: "#4F0FB0", display: "grid", placeItems: "center", fontWeight: 700 }}>T</span>
          <div><div style={{ fontFamily: DISPLAY, fontSize: 20, lineHeight: 1.1 }}>Tolu&apos;s week</div><div style={{ fontSize: 12, color: "#5C5C5C" }}>JAMB · SS3</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["Study streak", "5 days"], ["Quizzes done", "8"]].map(([l, v]) => (
            <div key={l} style={{ padding: 12, borderRadius: 16, background: "#FAF8FF" }}><div style={{ fontSize: 11, color: "#5C5C5C" }}>{l}</div><div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ padding: 12, borderRadius: 16, border: "1px solid #EEE8FB", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Study time</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64 }}>
            {bars.map((h, i) => <span key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 6, background: i === 3 ? "#6B26FF" : i === 6 ? "#F2EEF8" : "#EADFFF" }} />)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#737373" }}>{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, background: "#E9F8EF", color: "#0F5B2E" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          <span><b>Attended</b> Thursday&apos;s live class</span>
        </div>
      </div>
    </div>
  );
}

export function Parents({ data, blockId }: { data: FieldData; blockId: string }) {
  const pillars = list(data, "pillars");
  return (
    <section id="parents" data-block-id={blockId} style={{ containerType: "inline-size", background: "#F6F1FF", color: "#171717", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(64px,8cqw,112px) clamp(20px,5cqw,56px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(48px,6cqw,80px)" }}>
        <div style={{ flex: "1 1 480px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
          {str(data, "eyebrow") && <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "#fff", color: "#4F0FB0", fontSize: 14, fontWeight: 700 }}>{str(data, "eyebrow")}</span>}
          <H2>{str(data, "headline")}</H2>
          <Lead maxWidth={540}>{str(data, "body")}</Lead>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 12, width: "100%" }}>
            {pillars.map((p, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 22, background: "#fff", display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{str(p, "title")}</span>
                <span style={{ fontSize: 14, lineHeight: 1.55, color: "#4A4A4A" }}>{str(p, "body")}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {str(data, "cta_label") && <Button href={str(data, "cta_href")} arrow>{str(data, "cta_label")}</Button>}
            {str(data, "secondary_label") && (
              <A href={str(data, "secondary_href")} className="mcc-link" style={{ display: "inline-flex", alignItems: "center", minHeight: 52, padding: "0 8px", fontSize: 16, fontWeight: 600, color: "#4F0FB0" }}>
                {str(data, "secondary_label")}
              </A>
            )}
          </div>
        </div>
        <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", justifyContent: "center" }}>
          <ParentPhone />
        </div>
      </div>
    </section>
  );
}
