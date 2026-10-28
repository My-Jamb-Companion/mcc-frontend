"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { Button, DISPLAY, Eyebrow } from "../ui";
import { useNarrow } from "../hooks/useContainerWidth";
import { useScrollPanels } from "../hooks/useScrollPanels";

const DEFAULT_PANELS = [
  { short: "Streaks", title: "Streaks that keep you going", body: "Study a little every day. Your streak grows, and so does your confidence." },
  { short: "XP & badges", title: "Earn XP and unlock badges", body: "Every lesson, quiz and flashcard earns XP. Level up and collect badges along the way." },
  { short: "Leaderboard", title: "Climb the weekly leaderboard", body: "Friendly competition with students preparing for the same exam, with a fresh start every week." },
  { short: "Certificates", title: "Certificates you can share", body: "Finish a programme or course and get a certificate to show your parents, school or employer." },
];

const BADGES: [string, string, boolean][] = [["1st", "First quiz", true], ["7", "Week streak", true], ["100", "Perfect score", true], ["A+", "Top of class", false], ["30", "Month streak", false], ["★", "Mock master", false]];
const PEOPLE: [string, string, string][] = [["Chidinma", "C", "1,240"], ["Ibrahim", "I", "1,180"], ["You · Tolu", "T", "1,060"], ["Aisha", "A", "990"], ["Emeka", "E", "940"]];

const Screen = ({ on, children, style }: { on: boolean; children: ReactNode; style?: CSSProperties }) => (
  <div aria-hidden={!on} style={{ position: "absolute", inset: 0, padding: 28, display: "flex", flexDirection: "column", opacity: on ? 1 : 0, transform: on ? "none" : "translateY(18px) scale(.97)", transition: "opacity .45s ease, transform .45s ease", ...style }}>
    {children}
  </div>
);

const day = (kind: "done" | "today" | "todo"): CSSProperties => ({
  display: "block", margin: "6px auto 0", width: 30, height: 30, borderRadius: "50%", boxSizing: "border-box",
  background: kind === "todo" ? "#fff" : "#6717DE", border: kind === "todo" ? "2px dashed #B9A6E8" : undefined, boxShadow: kind === "today" ? "0 0 0 4px #EADFFF" : undefined,
});

/** The four screens of the progress picture: a streak, level and badges, a leaderboard where "you" climb, and a certificate. Sample content. */
function Stage({ active }: { active: number }) {
  return (
    <div aria-hidden="true" style={{ position: "relative", width: "100%", maxWidth: 440, aspectRatio: "44/52", borderRadius: 24, background: "#F6F1FF", overflow: "hidden" }}>
      <Screen on={active === 0} style={{ alignItems: "center", justifyContent: "center", gap: 18, textAlign: "center" }}>
        <span style={{ position: "relative", width: 120, height: 120 }}>
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#B79CFF", animation: "slhqPulse 2.2s ease-out infinite" }} />
          <span style={{ position: "relative", display: "grid", placeItems: "center", width: 120, height: 120, borderRadius: "50%", background: "#6717DE", color: "#fff" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
          </span>
        </span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>5-day streak</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, width: "100%", maxWidth: 320, fontSize: 12, fontWeight: 700, color: "#4A4A4A" }}>
          {([["M", "done"], ["T", "done"], ["W", "done"], ["T", "done"], ["F", "today"], ["S", "todo"], ["S", "todo"]] as const).map(([d, kind], k) => (
            <span key={k} style={kind === "today" ? { color: "#171717" } : undefined}>{d}<span style={day(kind)} /></span>
          ))}
        </div>
        <span style={{ fontSize: 15, color: "#4A4A4A" }}>Study for 10 minutes tomorrow to keep it going.</span>
      </Screen>
      <Screen on={active === 1} style={{ gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: "#6717DE" }}>YOUR LEVEL</span>
            <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>Level 4</span>
          </div>
          <span style={{ padding: "6px 12px", borderRadius: 999, background: "#171717", color: "#fff", fontSize: 13, fontWeight: 700, animation: "slhqFloat 3s ease-in-out infinite" }}>+20 XP</span>
        </div>
        <div>
          <span style={{ display: "block", height: 14, borderRadius: 14, background: "#fff", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: active === 1 ? "72%" : "40%", borderRadius: 14, background: "#6B26FF", transition: "width 1.2s cubic-bezier(.3,.7,.3,1)" }} />
          </span>
          <span style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4A4A4A", marginTop: 6 }}><span>720 XP</span><span>1,000 XP to Level 5</span></span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", color: "#4A4A4A" }}>BADGES</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {BADGES.map(([glyph, name, got]) => (
            <div key={name} style={{ padding: "12px 6px", borderRadius: 16, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: got ? "#6717DE" : "#fff", color: got ? "#fff" : "#737373", display: "grid", placeItems: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, border: got ? 0 : "2px dashed #C9B8F0", boxSizing: "border-box" }}>{glyph}</span>
              <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, color: got ? "#171717" : "#5C5C5C" }}>{name}</span>
            </div>
          ))}
        </div>
      </Screen>
      <Screen on={active === 2} style={{ gap: 12 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: "#6717DE" }}>THIS WEEK · JAMB LEAGUE</span>
          <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, lineHeight: 1.05 }}>Leaderboard</span>
        </div>
        {PEOPLE.map(([name, init, xp], i) => {
          const you = i === 2;
          return (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, background: you ? "#6717DE" : "#fff", color: you ? "#fff" : "#171717", transform: you && active !== 2 ? "translateY(120px)" : "none", transition: "transform .7s cubic-bezier(.3,.7,.3,1)" }}>
              <span style={{ width: 24, fontWeight: 700, fontSize: 15 }}>{i + 1}</span>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: you ? "#fff" : "#EADFFF", color: "#4F0FB0", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, flex: "none" }}>{init}</span>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{name}</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{xp} XP</span>
            </div>
          );
        })}
        <span style={{ alignSelf: "flex-start", marginTop: 4, padding: "6px 12px", borderRadius: 999, background: "#E9F8EF", color: "#13703D", fontSize: 13, fontWeight: 700 }}>You moved up 2 places this week</span>
      </Screen>
      <Screen on={active === 3} style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "100%", padding: "26px 22px", borderRadius: 16, background: "#fff", boxShadow: "0 24px 44px -26px rgba(60,20,140,.55)", display: "flex", flexDirection: "column", gap: 12, outline: "2px solid #EADFFF", outlineOffset: -10, transform: "rotate(-2deg)" }}>
          <img src="/brand/logo-horizontal.png" alt="" style={{ height: 22, width: "auto", alignSelf: "flex-start" }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", color: "#6717DE" }}>CERTIFICATE OF COMPLETION</span>
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, lineHeight: 1.05 }}>Tolu Adeyemi</span>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: "#4A4A4A" }}>has completed <b style={{ color: "#171717" }}>JAMB Use of English</b>, Modules 1–6, and passed every module test.</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 }}>
            <span style={{ fontSize: 12, color: "#5C5C5C" }}>Sample certificate</span>
            <span style={{ width: 56, height: 56, borderRadius: "50%", background: "#6717DE", display: "grid", placeItems: "center" }}>
              <img src="/brand/mark.png" alt="" style={{ width: 30, height: 30, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </span>
          </div>
        </div>
        <span style={{ marginTop: 22, padding: "8px 14px", borderRadius: 10, background: "#171717", color: "#fff", fontSize: 14, fontWeight: 700, animation: "slhqFloat 4s ease-in-out infinite" }}>Share with parents or school</span>
      </Screen>
    </div>
  );
}

/**
 * Progress and rewards: a picture that stays in view while four short texts scroll past, and changes with the one being read
 * (streak, XP and badges, leaderboard, certificate). On a narrow screen the four are tabs above the picture.
 */
export function Progress({ data, blockId }: { data: FieldData; blockId: string }) {
  const [section, setSection] = useState<HTMLElement | null>(null);
  const compact = useNarrow(section, 760);
  const fromData = list(data, "panels").map((p) => ({ short: str(p, "short"), title: str(p, "title"), body: str(p, "body") }));
  const panels = fromData.length ? fromData.slice(0, 4) : DEFAULT_PANELS;
  const { active, pick, stage, panelRefs } = useScrollPanels(panels.length, compact);
  const current = panels[active];

  return (
    <section ref={setSection} id="progress" data-block-id={blockId} style={{ containerType: "inline-size", background: "#fff", color: "#171717" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(64px,8cqw,112px) clamp(20px,5cqw,56px)", display: "flex", flexDirection: "column", gap: "clamp(28px,4cqw,48px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 700 }}>
          <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
          <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(36px,5.2cqw,64px)", lineHeight: 1, letterSpacing: "-0.015em", textWrap: "balance" }}>{str(data, "headline")}</h2>
          {str(data, "body") && <p style={{ margin: 0, fontSize: "clamp(16px,1.5cqw,18px)", lineHeight: 1.6, color: "#4A4A4A", maxWidth: 560, textWrap: "pretty" }}>{str(data, "body")}</p>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr)", gap: "clamp(32px,5cqw,80px)", alignItems: "start" }}>
          <div ref={stage} style={{ position: compact ? "relative" : "sticky", top: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, minWidth: 0 }}>
            {compact && (
              <div role="tablist" aria-label="Progress features" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {panels.map((p, k) => (
                  <button key={k} type="button" role="tab" aria-selected={active === k} onClick={() => pick(k)} style={{ minHeight: 44, padding: "0 14px", borderRadius: 999, border: `1.5px solid ${active === k ? "#6717DE" : "#E2DAF3"}`, background: active === k ? "#6717DE" : "#fff", color: active === k ? "#fff" : "#4F0FB0", font: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .3s" }}>{p.short || p.title}</button>
                ))}
              </div>
            )}
            <Stage active={active} />
            {compact && current && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 440, minHeight: 130, alignSelf: "stretch" }}>
                <h3 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, lineHeight: 1.1 }}>{current.title}</h3>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "#4A4A4A" }}>{current.body}</p>
              </div>
            )}
          </div>
          {!compact && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {panels.map((p, k) => {
                const on = active === k;
                return (
                  <div
                    key={k} ref={(el) => { panelRefs.current[k] = el; }} role="button" tabIndex={0} onClick={() => pick(k)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(k); } }}
                    style={{ minHeight: "clamp(300px,52vh,460px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "28px 0", borderTop: "1px solid #EEE8FB", cursor: "pointer" }}
                  >
                    <span style={{ alignSelf: "flex-start", padding: "5px 12px", borderRadius: 999, background: on ? "#6717DE" : "#fff", color: on ? "#fff" : "#4F0FB0", border: on ? undefined : "1px solid #E2DAF3", fontSize: 13, fontWeight: 700, transition: "background .4s" }}>{`0${k + 1}`}</span>
                    <h3 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3.2cqw,40px)", lineHeight: 1.05, color: on ? "#171717" : "#737373", transition: "color .4s" }}>{p.title}</h3>
                    <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, maxWidth: 460, color: on ? "#4A4A4A" : "#737373", transition: "color .4s" }}>{p.body}</p>
                  </div>
                );
              })}
              {str(data, "cta_label") && (
                <div style={{ marginTop: 12 }}><Button href={str(data, "cta_href")} arrow>{str(data, "cta_label")}</Button></div>
              )}
            </div>
          )}
        </div>
        {compact && str(data, "cta_label") && <div><Button href={str(data, "cta_href")}>{str(data, "cta_label")}</Button></div>}
      </div>
    </section>
  );
}
