"use client";

import { DISPLAY, FRAME } from "../ui";
import { useCycle } from "../hooks/useCycle";

const SCREEN_LABELS = ["Show home screen", "Show flashcards", "Show quiz"];

/** One screen of the phone: fades and rises in when it is the current one. */
function Screen({ on, children, pad = 0, gap = 0 }: { on: boolean; children: React.ReactNode; pad?: string | number; gap?: number }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: pad, gap,
        opacity: on ? 1 : 0, transform: on ? "none" : "translateY(14px) scale(.97)",
        transition: "opacity .5s ease, transform .5s ease",
      }}
      aria-hidden={!on}
    >
      {children}
    </div>
  );
}

const card = { margin: "8px 10px 0", padding: 12, borderRadius: 16, background: "#fff", boxShadow: "0 1px 0 #EEE8FB,0 6px 16px -10px rgba(60,20,140,.25)" } as const;
const tile = { flex: 1, padding: 10, borderRadius: 14, background: "#fff", boxShadow: "0 1px 0 #EEE8FB" } as const;

/**
 * The phone in the hero. It turns through three sample screens (home, flashcards, a quiz) by itself, and a click on a dot
 * shows one and holds it for a few seconds. The screens are illustrations: sample names and numbers.
 */
export function HeroPhone() {
  const { index, pick } = useCycle(3, 3200);
  return (
    <div className="mcc-hero-phone" style={{ position: "absolute", left: 0, bottom: 0 }}>
      <div style={{ position: "relative", width: 230, height: 476, borderRadius: 38, ...FRAME, padding: 8, boxShadow: "0 40px 70px -28px rgba(60,20,140,.6)" }}>
        <div style={{ position: "relative", height: "100%", borderRadius: 30, background: "#FAF8FF", overflow: "hidden", fontSize: 12, color: "#171717" }}>
          <Screen on={index === 0}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px 2px", fontSize: 11, fontWeight: 700 }}>
              <span>9:41</span><span>4G</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px 4px" }}>
              <div>
                <div style={{ fontSize: 11, color: "#5C5C5C" }}>Good evening</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 21, lineHeight: 1.1 }}>Hi, Tolu</div>
              </div>
              <span style={{ padding: "5px 9px", borderRadius: 999, background: "#F4EFFF", color: "#4F0FB0", fontWeight: 700, fontSize: 11 }}>5-day streak</span>
            </div>
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "#6717DE" }}>CONTINUE · JAMB</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>Use of English</div>
              <div style={{ fontSize: 11, color: "#5C5C5C" }}>Module 3 · Comprehension</div>
              <div style={{ height: 7, borderRadius: 7, background: "#EEE8FB", margin: "10px 0 0", overflow: "hidden" }}>
                <div style={{ width: "60%", height: "100%", background: "#6B26FF" }} />
              </div>
            </div>
            <div style={{ ...card, background: "#6717DE", color: "#fff", boxShadow: "none" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em" }}>LIVE CLASS · 4:00PM</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>Chemistry with Mrs. Okafor</div>
            </div>
            <div style={{ margin: "8px 10px 0", display: "flex", gap: 6 }}>
              <div style={tile}><div style={{ fontSize: 10, color: "#5C5C5C" }}>Cards due</div><div style={{ fontSize: 16, fontWeight: 700 }}>14</div></div>
              <div style={tile}><div style={{ fontSize: 10, color: "#5C5C5C" }}>Goal</div><div style={{ fontSize: 16, fontWeight: 700 }}>2 / 3</div></div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ margin: "0 10px 12px", display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", borderRadius: 999, background: "#fff", border: "1px solid #E7E2F3" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#6B26FF,#B40D9B)", flex: "none" }} />
              <span style={{ flex: 1, color: "#5C5C5C", fontSize: 12 }}>Ask Brainy anything…</span>
            </div>
          </Screen>
          <Screen on={index === 1} pad="34px 12px 14px" gap={10}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", color: "#6717DE" }}>
              <span>BIOLOGY · CELLS</span><span style={{ color: "#5C5C5C" }}>3 / 12</span>
            </div>
            <div style={{ flex: 1, borderRadius: 16, background: "#6717DE", color: "#fff", padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em" }}>QUESTION</span>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>What does mitosis produce?</span>
              <span style={{ fontSize: 11 }}>Tap to flip</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, fontSize: 11, fontWeight: 700, textAlign: "center" }}>
              <span style={{ padding: "8px 0", borderRadius: 10, background: "#F5F3F8" }}>Again</span>
              <span style={{ padding: "8px 0", borderRadius: 10, background: "#F4EFFF", color: "#4F0FB0" }}>Good</span>
              <span style={{ padding: "8px 0", borderRadius: 10, background: "#E9F8EF", color: "#13703D" }}>Easy</span>
            </div>
          </Screen>
          <Screen on={index === 2} pad="34px 12px 14px" gap={8}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", color: "#6717DE" }}>JAMB MATHS · Q7 OF 40</div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>If 2x + 3 = 11, what is x?</div>
            <div style={{ padding: "9px 10px", borderRadius: 10, border: "1.5px solid #E7E2F3" }}>A · 3</div>
            <div style={{ padding: "9px 10px", borderRadius: 10, border: "2px solid #16A34A", background: "#ECFDF3", fontWeight: 700, color: "#0F5B2E", display: "flex", justifyContent: "space-between" }}>B · 4<span>Correct</span></div>
            <div style={{ padding: "9px 10px", borderRadius: 10, border: "1.5px solid #E7E2F3" }}>C · 5</div>
            <div style={{ padding: 10, borderRadius: 12, background: "#F4EFFF", lineHeight: 1.45, color: "#2B1A4F" }}><b style={{ color: "#4F0FB0" }}>Why?</b> 2x = 8, so x = 4.</div>
            <div style={{ flex: 1 }} />
            <span style={{ alignSelf: "center", padding: "6px 14px", borderRadius: 999, background: "#171717", color: "#fff", fontWeight: 700, fontSize: 12 }}>+20 XP</span>
          </Screen>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
        {SCREEN_LABELS.map((label, k) => (
          <button
            key={label} type="button" aria-label={label} aria-pressed={index === k} onClick={() => pick(k)}
            style={{ width: index === k ? 22 : 8, height: 8, padding: 0, border: 0, borderRadius: 8, background: index === k ? "#6717DE" : "#D9CCF5", cursor: "pointer", transition: "width .3s" }}
          />
        ))}
      </div>
    </div>
  );
}
