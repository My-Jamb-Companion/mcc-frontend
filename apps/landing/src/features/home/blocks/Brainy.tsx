import { list, str, strings } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Arrow, Check, DISPLAY } from "../ui";

const bubbleIn = { alignSelf: "flex-start" as const, maxWidth: "86%", padding: "10px 12px", borderRadius: "16px 16px 16px 4px", background: "#fff", border: "1px solid #EEE8FB", lineHeight: 1.45 };
const bubbleOut = { alignSelf: "flex-end" as const, maxWidth: "82%", padding: "9px 12px", borderRadius: "16px 16px 4px 16px", background: "#6717DE", color: "#fff" };

/** The phone chat and flashcard: sample content showing what Brainy does. */
function BrainyMockup() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480, height: 600 }} aria-hidden="true">
      <div style={{ position: "absolute", inset: "40px 0 0 30px", borderRadius: "50%", background: "radial-gradient(closest-side,rgba(107,38,255,.45),rgba(180,13,155,.12),transparent)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: "min(280px,86%)", height: 580, borderRadius: 44, background: "#1E1E1E", padding: 9, boxShadow: "0 30px 60px -20px rgba(0,0,0,.8)" }}>
        <div style={{ height: "100%", borderRadius: 36, background: "#fff", color: "#171717", overflow: "hidden", display: "flex", flexDirection: "column", fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 12px", borderBottom: "1px solid #F0ECF7" }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6B26FF,#B40D9B)", flex: "none" }} />
            <div><div style={{ fontWeight: 700, fontSize: 14 }}>Brainy</div><div style={{ fontSize: 11, color: "#13703D", fontWeight: 600 }}>Online</div></div>
          </div>
          <div style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: "#FAF8FF", overflow: "hidden" }}>
            <div style={{ alignSelf: "flex-end", maxWidth: "82%", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 14, background: "#fff", border: "1px solid #E7E2F3", fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 34, height: 34, borderRadius: 8, background: "#EDE7F7", display: "grid", placeItems: "center", color: "#6717DE" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                </span>
                Biology notes p.42
              </div>
              <div style={{ ...bubbleOut, maxWidth: "100%" }}>Abeg, make flashcards from this</div>
            </div>
            <div style={bubbleIn}>
              Done! I made <b>12 flashcards</b> on cell division. Want a quick 5-question quiz first?
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {["Start quiz", "See cards"].map((t) => <span key={t} style={{ padding: "5px 10px", borderRadius: 999, background: "#F4EFFF", color: "#4F0FB0", fontSize: 11, fontWeight: 700 }}>{t}</span>)}
              </div>
            </div>
            <div style={bubbleOut}>Mitosis vs meiosis? Explain like I&apos;m tired</div>
            <div style={bubbleIn}>Mitosis copies a cell: <b>2 identical</b> cells, for growth. Meiosis mixes things up: <b>4 different</b> cells, for reproduction.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 16px", borderTop: "1px solid #F0ECF7" }}>
            <span style={{ flex: 1, padding: "10px 12px", borderRadius: 999, background: "#F5F3F8", color: "#737373", fontSize: 12 }}>Ask, paste or snap…</span>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#6717DE", color: "#fff", display: "grid", placeItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v3" /></svg>
            </span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 0, bottom: 0, width: "min(240px,72%)", padding: 18, borderRadius: 24, background: "#fff", color: "#171717", boxShadow: "0 30px 60px -20px rgba(0,0,0,.8)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#6717DE" }}><span>BIOLOGY · CELLS</span><span style={{ color: "#737373" }}>3 / 12</span></div>
        <div style={{ fontFamily: DISPLAY, fontSize: 22, lineHeight: 1.15 }}>What does mitosis produce?</div>
        <div style={{ padding: "10px 12px", borderRadius: 14, border: "1.5px dashed #D9CCF5", fontSize: 13, color: "#525252" }}>Tap to flip</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
          {[["Again", "1 min", "#FDECEC", "#9B1C1C"], ["Good", "1 day", "#F4EFFF", "#4F0FB0"], ["Easy", "4 days", "#E9F8EF", "#13703D"]].map(([t, w, bg, fg]) => (
            <span key={t} style={{ padding: "8px 0", borderRadius: 12, background: bg, color: fg }}>{t}<span style={{ display: "block", fontWeight: 500, fontSize: 10 }}>{w}</span></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Brainy({ data, blockId }: { data: FieldData; blockId: string }) {
  const inputs = strings(data, "inputs");
  const features = list(data, "features");
  return (
    <section id="brainy" data-block-id={blockId} style={{ containerType: "inline-size", background: "#0A0A0A", color: "#fff", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(64px,8cqw,112px) clamp(20px,5cqw,56px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(48px,6cqw,80px)" }}>
        <div style={{ flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#C9B2FF" }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#6B26FF,#B40D9B)" }} />
            {str(data, "eyebrow")}
          </span>
          <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(38px,5.4cqw,64px)", lineHeight: 1.02, letterSpacing: "-0.01em", textWrap: "balance" }}>{str(data, "headline")}</h2>
          <p style={{ margin: 0, fontSize: "clamp(16px,1.5cqw,18px)", lineHeight: 1.6, color: "#C7C7C7", maxWidth: 520, textWrap: "pretty" }}>{str(data, "body")}</p>
          {inputs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#A3A3A3" }}>Works with</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {inputs.map((i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", minHeight: 36, padding: "0 14px", borderRadius: 999, background: "#1C1A22", border: "1px solid #2E2A38", fontSize: 14, fontWeight: 500, color: "#EDEDED" }}>{i}</span>)}
              </div>
            </div>
          )}
          <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 18, maxWidth: 520 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: "flex", gap: 14 }}>
                <span style={{ width: 28, height: 28, flex: "none", borderRadius: 9, background: "#24163F", color: "#C9B2FF", display: "grid", placeItems: "center", marginTop: 1 }}><Check size={15} width={2.6} /></span>
                <span><span style={{ display: "block", fontSize: 16, fontWeight: 600 }}>{str(f, "title")}</span><span style={{ display: "block", fontSize: 15, lineHeight: 1.55, color: "#BDBDBD", marginTop: 2 }}>{str(f, "body")}</span></span>
              </li>
            ))}
          </ul>
          {str(data, "cta_label") && (
            <A href={str(data, "cta_href")} className="mcc-btn mcc-btn-white" style={{ display: "inline-flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 24px", borderRadius: 999, background: "#fff", color: "#4F0FB0", fontSize: 16, fontWeight: 700, marginTop: 6 }}>
              {str(data, "cta_label")}
              <Arrow />
            </A>
          )}
        </div>
        <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", justifyContent: "center" }}>
          <BrainyMockup />
        </div>
      </div>
    </section>
  );
}
