import { str, strings } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Button, Check, DISPLAY } from "../ui";

const GRADIENT = "linear-gradient(90deg,#6B26FF,#B40D9B)";

/** The app screen inside the hero phone: sample values, there to show what the app looks like. */
function HeroPhone() {
  return (
    <div style={{ position: "relative", width: "min(300px,84%)", aspectRatio: "300/620", borderRadius: 46, background: "#0A0A0A", padding: 10, boxShadow: "0 40px 80px -30px rgba(80,20,180,.45)" }}>
      <div style={{ height: "100%", borderRadius: 37, background: "#FAF8FF", overflow: "hidden", display: "flex", flexDirection: "column", fontSize: 13, color: "#171717" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 22px 4px", fontSize: 12, fontWeight: 600 }}>
          <span>9:41</span><span style={{ width: 76, height: 22, borderRadius: 12, background: "#0A0A0A" }} /><span>4G</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px 6px" }}>
          <div>
            <div style={{ fontSize: 12, color: "#5C5C5C" }}>Good evening</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 24, lineHeight: 1.1 }}>Hi, Tolu</div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 999, background: "#FFF1D1", color: "#7A4A00", fontWeight: 700, fontSize: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
            5-day streak
          </span>
        </div>
        <div style={{ margin: "8px 14px 0", padding: 14, borderRadius: 20, background: "#fff", boxShadow: "0 1px 0 #EEE8FB,0 6px 16px -10px rgba(60,20,140,.25)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#6717DE" }}>CONTINUE · JAMB</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Use of English</div>
          <div style={{ fontSize: 12, color: "#5C5C5C" }}>Module 3 · Comprehension</div>
          <div style={{ height: 8, borderRadius: 8, background: "#EEE8FB", margin: "12px 0 10px", overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", borderRadius: 8, background: "#6B26FF" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#5C5C5C" }}>6 of 10 lessons</span>
            <span style={{ padding: "6px 12px", borderRadius: 999, background: "#6717DE", color: "#fff", fontSize: 12, fontWeight: 600 }}>Resume</span>
          </div>
        </div>
        <div style={{ margin: "10px 14px 0", padding: 14, borderRadius: 20, background: "#6717DE", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", opacity: 0.85 }}>LIVE CLASS · THU 4:00PM</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Chemistry with Mrs. Okafor</div>
          </div>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "#fff", color: "#4F0FB0", fontSize: 12, fontWeight: 700 }}>Join</span>
        </div>
        <div style={{ margin: "10px 14px 0", display: "flex", gap: 8 }}>
          {[["Flashcards due", "14"], ["Today's goal", "2 / 3"]].map(([label, value]) => (
            <div key={label} style={{ flex: 1, padding: 12, borderRadius: 16, background: "#fff", boxShadow: "0 1px 0 #EEE8FB" }}>
              <div style={{ fontSize: 11, color: "#5C5C5C" }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ margin: "0 14px 10px", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 999, background: "#fff", border: "1px solid #E7E2F3" }}>
          <span style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6B26FF,#B40D9B)", flex: "none" }} />
          <span style={{ flex: 1, color: "#5C5C5C", fontSize: 13 }}>Ask Brainy anything…</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6717DE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 8px 16px", borderTop: "1px solid #EEE8FB", background: "#fff", fontSize: 11, fontWeight: 600, color: "#737373" }}>
          <span style={{ color: "#6717DE" }}>Home</span><span>Learn</span><span>Brainy</span><span>Me</span>
        </div>
      </div>
    </div>
  );
}

const chip = { position: "absolute" as const, alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 16, background: "#fff", boxShadow: "0 14px 30px -14px rgba(40,10,100,.35)", fontSize: 13, fontWeight: 600 };

export function Hero({ data, blockId }: { data: FieldData; blockId: string }) {
  const ticks = strings(data, "ticks");
  return (
    <section id="top" data-block-id={blockId} style={{ containerType: "inline-size", background: "#fff", color: "#171717", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(36px,6cqw,88px) clamp(20px,5cqw,56px) clamp(56px,7cqw,104px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(48px,6cqw,72px)" }}>
        <div style={{ flex: "1 1 460px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 }}>
          {str(data, "eyebrow") && (
            <a href="#brainy" className="mcc-btn" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, background: "#F4EFFF", color: "#4F0FB0", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              <span style={{ padding: "3px 10px", borderRadius: 999, background: "#6717DE", color: "#fff", fontSize: 12 }}>New</span>
              {str(data, "eyebrow")}
            </a>
          )}
          <h1 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(46px,7.2cqw,88px)", lineHeight: 0.98, letterSpacing: "-0.01em", textWrap: "balance" }}>
            {str(data, "headline_lead")}{" "}
            <span style={{ background: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{str(data, "headline_emph")}</span>
          </h1>
          {str(data, "body") && (
            <p style={{ margin: 0, fontSize: "clamp(17px,1.6cqw,20px)", lineHeight: 1.55, color: "#404040", maxWidth: 540, textWrap: "pretty" }}>{str(data, "body")}</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, width: "100%" }}>
            <Button href={str(data, "cta_href")} size="lg" arrow shadow>{str(data, "cta_label")}</Button>
            {str(data, "parent_label") && <Button href={str(data, "parent_href")} tone="outline" size="lg">{str(data, "parent_label")}</Button>}
          </div>
          {str(data, "login_label") && (
            <p style={{ margin: 0, fontSize: 15, color: "#525252" }}>
              {str(data, "login_prompt")}{" "}
              <A href={str(data, "login_href")} style={{ color: "#6717DE", fontWeight: 600 }}>{str(data, "login_label")}</A>
            </p>
          )}
          {ticks.length > 0 && (
            <ul style={{ listStyle: "none", margin: "4px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "10px 20px", fontSize: 14, fontWeight: 500, color: "#404040" }}>
              {ticks.map((t) => (
                <li key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#E9F8EF", color: "#13703D", display: "grid", placeItems: "center" }}><Check /></span>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ flex: "1 1 380px", minWidth: 0, position: "relative", display: "flex", justifyContent: "center", alignItems: "center", padding: "12px 0" }} aria-hidden="true">
          <div style={{ position: "absolute", width: "min(500px,100%)", aspectRatio: "1", borderRadius: "50%", background: "#F4EFFF" }} />
          <div style={{ position: "absolute", width: "min(330px,70%)", aspectRatio: "1", borderRadius: "50%", background: "#EADFFF", right: "4%", top: "2%" }} />
          <HeroPhone />
          <div className="mcc-wide-only" style={{ ...chip, left: 0, top: "18%" }}>
            <span style={{ width: 30, height: 30, borderRadius: 10, background: "#E9F8EF", color: "#13703D", display: "grid", placeItems: "center" }}><Check size={16} /></span>
            <span>Quiz complete<span style={{ display: "block", fontWeight: 500, color: "#5C5C5C", fontSize: 12 }}>+20 XP earned</span></span>
          </div>
          <div className="mcc-wide-only" style={{ ...chip, right: 0, bottom: "20%" }}>
            <span style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg,#6B26FF,#B40D9B)" }} />
            <span>Flashcards ready<span style={{ display: "block", fontWeight: 500, color: "#5C5C5C", fontSize: 12 }}>From your Biology notes</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
