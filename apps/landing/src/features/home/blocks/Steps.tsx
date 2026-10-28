"use client";

import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { Button, DISPLAY, Eyebrow } from "../ui";
import { useCycle } from "../hooks/useCycle";

/** Pages published before the steps had short names get these. */
const FALLBACK_LABELS = ["Sign up", "Free call", "Learn", "Track"];
const FLOAT = (seconds: number, delay = 0) => ({ animation: `slhqFloat ${seconds}s ease-in-out ${delay}s infinite` });
const badge = { position: "absolute" as const, padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 };

/** The picture at the top of each step: a small illustration of that moment in the app. Sample names and numbers. */
function Scene({ step, active }: { step: number; active: boolean }) {
  const frame = { position: "relative" as const, height: 200, overflow: "hidden", display: "grid", placeItems: "center" };
  if (step === 0) {
    return (
      <div style={{ ...frame, background: "#EFE7FF" }} aria-hidden="true">
        <div style={{ width: "72%", padding: 14, borderRadius: 14, background: "#fff", boxShadow: "0 12px 28px -16px rgba(60,20,140,.45)", display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Create your account</span>
          <span style={{ padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E7E2F3", color: "#404040" }}>Tolu Adeyemi</span>
          <span style={{ padding: "8px 10px", borderRadius: 8, border: "1.5px solid #6B26FF", color: "#404040" }}>+234 801 •••• •••</span>
          <span style={{ padding: "8px 10px", borderRadius: 8, background: "#6717DE", color: "#fff", fontWeight: 700 }}>Get started free</span>
        </div>
        <span style={{ ...badge, right: 12, top: 14, background: "#E9F8EF", color: "#13703D", ...FLOAT(4) }}>No card needed</span>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div style={{ ...frame, background: "#6717DE" }} aria-hidden="true">
        <div style={{ width: "76%", padding: 16, borderRadius: 14, background: "#fff", boxShadow: "0 12px 28px -16px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontSize: 12, textAlign: "center" }}>
          <span style={{ position: "relative", width: 52, height: 52 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#B79CFF", animation: "slhqPulse 1.8s ease-out infinite" }} />
            <span style={{ position: "relative", display: "grid", placeItems: "center", width: 52, height: 52, borderRadius: "50%", background: "#EADFFF", color: "#4F0FB0", fontWeight: 700, fontSize: 18 }}>A</span>
          </span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Amaka is calling…<span style={{ display: "block", fontWeight: 400, color: "#5C5C5C", fontSize: 12 }}>Customer Relations, SmartLearnersHQ</span></span>
          <span style={{ display: "flex", gap: 10 }}><span style={{ width: 34, height: 34, borderRadius: "50%", background: "#9B1C1C" }} /><span style={{ width: 34, height: 34, borderRadius: "50%", background: "#16A34A" }} /></span>
        </div>
        <span style={{ ...badge, left: 12, top: 14, background: "#fff", color: "#4F0FB0", ...FLOAT(4.5, 0.6) }}>Free · a real person</span>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div style={{ ...frame, background: "#171717" }} aria-hidden="true">
        <div style={{ width: "74%", borderRadius: 14, background: "#fff", overflow: "hidden", boxShadow: "0 12px 28px -16px rgba(0,0,0,.6)", fontSize: 12 }}>
          <div style={{ height: 72, background: "#EADFFF", display: "grid", placeItems: "center" }}>
            <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#6717DE", display: "grid", placeItems: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M6 4l14 8-14 8z" /></svg>
            </span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Comprehension</span>
            <span style={{ display: "block", color: "#5C5C5C" }}>Module 3 · Lesson 6</span>
            <span style={{ display: "block", height: 6, borderRadius: 6, background: "#EEE8FB", marginTop: 8, overflow: "hidden" }}><span style={{ display: "block", width: "60%", height: "100%", background: "#6B26FF" }} /></span>
          </div>
        </div>
        <span style={{ ...badge, right: 10, top: 14, background: "#E9F8EF", color: "#13703D", ...FLOAT(4, 0.3) }}>Quiz passed</span>
        <span style={{ ...badge, left: 10, bottom: 12, background: "#6717DE", color: "#fff", ...FLOAT(5, 1) }}>Live class Thu</span>
      </div>
    );
  }
  return (
    <div style={{ ...frame, background: "#EFE7FF" }} aria-hidden="true">
      <div style={{ width: "74%", padding: 14, borderRadius: 14, background: "#fff", boxShadow: "0 12px 28px -16px rgba(60,20,140,.45)", fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>This week</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 70 }}>
          {[35, 60, 48, active ? 95 : 55, 30].map((h, k) => (
            <span key={k} style={{ flex: 1, height: `${h}%`, borderRadius: 5, background: k === 3 ? "#6B26FF" : "#EADFFF", transition: k === 3 ? "height .8s ease" : undefined }} />
          ))}
        </div>
      </div>
      <span style={{ ...badge, left: 10, top: 14, background: "#171717", color: "#fff", ...FLOAT(4.2, 0.8) }}>Certificate unlocked</span>
    </div>
  );
}

/**
 * How it works: four steps, one lit at a time. They advance on their own while the section is on screen (a click on a step
 * or its bar picks it and holds it for a few seconds), and the lit step lifts and shows its number filled in.
 */
export function Steps({ data, blockId }: { data: FieldData; blockId: string }) {
  const steps = list(data, "steps").slice(0, 4);
  const { index, pick, ref } = useCycle(Math.max(steps.length, 1), 2800, { holdMs: 9000, whenVisible: true });
  return (
    <section ref={ref as React.RefObject<HTMLElement>} id="how" data-block-id={blockId} style={{ containerType: "inline-size", background: "#F6F1FF", color: "#171717", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(64px,8cqw,112px) clamp(20px,5cqw,56px)", display: "flex", flexDirection: "column", gap: 36 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 700 }}>
            <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
            <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,6cqw,76px)", lineHeight: 0.98, letterSpacing: "-0.02em", textWrap: "balance" }}>{str(data, "headline")}</h2>
          </div>
          {str(data, "body") && <p style={{ margin: 0, fontSize: "clamp(16px,1.5cqw,18px)", lineHeight: 1.6, color: "#4A4A4A", maxWidth: 380, textWrap: "pretty" }}>{str(data, "body")}</p>}
        </div>
        <div role="tablist" aria-label="Steps" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(steps.length, 1)},minmax(0,1fr))`, gap: 10 }}>
          {steps.map((s, k) => (
            <button key={k} type="button" role="tab" aria-selected={index === k} onClick={() => pick(k)} style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 44, padding: 0, border: 0, background: "transparent", font: "inherit", textAlign: "left", cursor: "pointer", color: "#171717" }}>
              <span style={{ display: "block", width: "100%", height: 6, borderRadius: 6, background: "#E2D8F7", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: k <= index ? "100%" : "0%", background: "#6717DE", transition: "width .6s ease" }} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{`0${k + 1} ${str(s, "label") || FALLBACK_LABELS[k] || ""}`.trim()}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: 16, alignItems: "start" }}>
          {steps.map((s, k) => {
            const on = index === k;
            return (
              <div
                key={k} role="button" tabIndex={0} onClick={() => pick(k)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(k); } }}
                style={{
                  display: "flex", flexDirection: "column", borderRadius: 16, background: "#fff", overflow: "hidden", cursor: "pointer",
                  outline: `2px solid ${on ? "#6B26FF" : "transparent"}`, transform: on ? "translateY(-8px)" : "none",
                  boxShadow: on ? "0 28px 50px -30px rgba(60,20,140,.6)" : "none", transition: "transform .4s ease, box-shadow .4s ease, outline-color .4s",
                }}
              >
                <Scene step={k} active={on} />
                <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, lineHeight: 0.9, color: on ? "#6717DE" : "transparent", WebkitTextStroke: "2px #6717DE", transition: "color .4s" }}>{k + 1}</span>
                  <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.25, fontWeight: 700 }}>{str(s, "title")}</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "#4A4A4A" }}>{str(s, "body")}</p>
                </div>
              </div>
            );
          })}
        </div>
        {str(data, "cta_label") && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}>
            <Button href={str(data, "cta_href")} arrow>{str(data, "cta_label")}</Button>
            <span style={{ fontSize: 15, color: "#4A4A4A" }}>{str(data, "note")}</span>
          </div>
        )}
      </div>
    </section>
  );
}
