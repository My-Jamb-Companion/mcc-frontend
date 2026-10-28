"use client";

import { useEffect, useRef, useState } from "react";
import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, DISPLAY, Eyebrow, Lead } from "../ui";

/** The sample test the phone plays. Illustration only: three real-looking questions. */
const QUESTIONS = [
  { subject: "JAMB MATHS", text: "If 2x + 3 = 11, what is the value of x?", opts: ["3", "4", "5", "7"], ans: 1, why: "Take 3 from both sides: 2x = 8. Divide by 2: x = 4." },
  { subject: "JAMB MATHS", text: "Simplify ¾ ÷ ⅜", opts: ["½", "2", "9⁄32", "1½"], ans: 1, why: "Dividing by a fraction means multiplying by its flip: ¾ × 8⁄3 = 24⁄12 = 2." },
  { subject: "USE OF ENGLISH", text: "Choose the word nearest in meaning to “candid”.", opts: ["Frank", "Careful", "Rude", "Shy"], ans: 0, why: "Candid means open and honest, so “frank” is the closest match." },
];
const START_SECONDS = 1122;
const PASS_MARK = 60;
const CONFETTI = [[-6, 20], [130, 10], [150, 70], [-14, 96], [24, -8], [110, 136], [60, 150], [140, 120], [-4, 140], [80, -12]];

type Phase = "quiz" | "submitting" | "result";

/** The practice phone is a working mini test: pick answers, see the explanation, submit, and get a score with a ring that fills. */
function QuizPhone({ ctaLabel, ctaHref }: { ctaLabel: string; ctaHref: string }) {
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [bar, setBar] = useState(0);
  const [ring, setRing] = useState(0);
  const [time, setTime] = useState(START_SECONDS);
  const root = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ringTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const el = root.current;
    let observer: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== "undefined") {
      visible.current = false;
      observer = new IntersectionObserver(([e]) => { visible.current = !!e?.isIntersecting; }, { threshold: 0.2 });
      observer.observe(el);
    }
    const clock = setInterval(() => { if (visible.current) setTime((t) => Math.max(0, t - 1)); }, 1000);
    const pending = timers.current;
    return () => { clearInterval(clock); clearInterval(ringTimer.current); pending.forEach(clearTimeout); observer?.disconnect(); };
  }, []);

  const cur = QUESTIONS[q];
  const answered = picked !== null;
  const last = q === QUESTIONS.length - 1;
  const total = QUESTIONS.length;
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= PASS_MARK;

  function choose(k: number) {
    if (picked !== null) return;
    setPicked(k);
    if (k === cur.ans) setCorrect((c) => c + 1);
  }

  function submit() {
    setPhase("submitting");
    setBar(0);
    timers.current.push(setTimeout(() => setBar(100), 40));
    timers.current.push(setTimeout(() => {
      setPhase("result");
      setRing(0);
      const target = correct / total;
      clearInterval(ringTimer.current);
      ringTimer.current = setInterval(() => {
        setRing((r) => {
          const next = Math.min(target, r + 0.04);
          if (next >= target) clearInterval(ringTimer.current);
          return next;
        });
      }, 24);
    }, 1450));
  }

  function reset() {
    clearInterval(ringTimer.current);
    setQ(0); setPicked(null); setCorrect(0); setPhase("quiz"); setRing(0); setBar(0); setTime(START_SECONDS);
  }

  const optionStyle = (k: number) => {
    const isAns = k === cur.ans;
    const isPick = k === picked;
    if (answered && isAns) return { bg: "#ECFDF3", border: "2px solid #16A34A", fg: "#0F5B2E", badgeBg: "#16A34A", badgeFg: "#fff", mark: "Correct" };
    if (answered && isPick) return { bg: "#FDECEC", border: "2px solid #9B1C1C", fg: "#7F1D1D", badgeBg: "#9B1C1C", badgeFg: "#fff", mark: "Your answer" };
    return { bg: "#fff", border: "1.5px solid #E7E2F3", fg: answered ? "#5C5C5C" : "#171717", badgeBg: "#F5F3F8", badgeFg: "#171717", mark: "" };
  };

  return (
    <div ref={root} style={{ position: "relative", width: 300, maxWidth: "92%", height: 600, borderRadius: 44, background: "#0A0A0A", padding: 9, boxShadow: "0 30px 60px -24px rgba(60,20,140,.5)" }}>
      <div style={{ position: "relative", height: "100%", borderRadius: 36, background: "#fff", overflow: "hidden", fontSize: 13, display: "flex", flexDirection: "column" }}>
        {phase === "quiz" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 14px 16px", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#6717DE" }}>{`SAMPLE TEST · ${cur.subject}`}</div>
                <div style={{ fontSize: 12, color: "#5C5C5C", marginTop: 2 }}>Question {q + 1} of {total}</div>
              </div>
              <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, background: "#171717", color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "ui-monospace,Menlo,monospace" }}>
                {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 6, background: "#EEE8FB", overflow: "hidden" }}>
              <div style={{ width: `${Math.round(((q + (answered ? 1 : 0)) / total) * 100)}%`, height: "100%", background: "#6B26FF", transition: "width .4s ease" }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.35, padding: "4px 2px" }}>{cur.text}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cur.opts.map((text, k) => {
                const st = optionStyle(k);
                return (
                  <button
                    key={text} type="button" onClick={() => choose(k)} disabled={answered}
                    style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 46, padding: "0 12px", borderRadius: 12, border: st.border, background: st.bg, color: st.fg, font: "inherit", fontSize: 14, fontWeight: 700, textAlign: "left", cursor: answered ? "default" : "pointer", transition: "background .2s,border-color .2s", transform: answered && k === cur.ans ? "scale(1.02)" : "none" }}
                  >
                    <span style={{ width: 26, height: 26, flex: "none", borderRadius: 8, background: st.badgeBg, color: st.badgeFg, display: "grid", placeItems: "center", fontSize: 12 }}>{"ABCD"[k]}</span>
                    <span style={{ flex: 1 }}>{text}</span>
                    <span style={{ fontSize: 11 }}>{st.mark}</span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <>
                <div style={{ padding: 12, borderRadius: 12, background: "#F4EFFF", lineHeight: 1.5, color: "#2B1A4F", fontSize: 13, animation: "slhqPop .35s ease-out" }}>
                  <b style={{ color: "#4F0FB0" }}>{picked === cur.ans ? "Nice one!" : "Not quite."}</b> {cur.why}
                </div>
                <div style={{ flex: 1 }} />
                <button type="button" onClick={() => (last ? submit() : (setQ((n) => n + 1), setPicked(null)))} style={{ minHeight: 48, border: 0, borderRadius: 10, background: "#6717DE", color: "#fff", font: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  {last ? "Submit test" : "Next question"}
                </button>
              </>
            )}
          </div>
        )}
        {phase === "submitting" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 24 }}>
            <span style={{ width: 56, height: 56, borderRadius: "50%", border: "5px solid #EEE8FB", borderTopColor: "#6717DE", animation: "slhqSpin .8s linear infinite" }} />
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22 }}>Marking your test…</span>
            <span style={{ display: "block", width: "80%", height: 8, borderRadius: 8, background: "#EEE8FB", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${bar}%`, background: "#6B26FF", transition: "width 1.3s ease" }} />
            </span>
          </div>
        )}
        {phase === "result" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "30px 18px 18px", textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#6717DE" }}>SAMPLE TEST · RESULTS</span>
            <div style={{ position: "relative", width: 150, height: 150 }}>
              {passed && CONFETTI.map(([x, y], i) => (
                <span key={i} style={{ position: "absolute", left: x, top: y, width: i % 3 === 0 ? 10 : 7, height: i % 3 === 0 ? 10 : 7, borderRadius: i % 2 ? 2 : "50%", background: ["#6B26FF", "#16A34A", "#EADFFF", "#171717"][i % 4], animation: `slhqPop .5s ease-out ${(0.5 + i * 0.05).toFixed(2)}s both` }} />
              ))}
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(${passed ? "#16A34A" : "#6B26FF"} 0 ${Math.round(ring * 360)}deg, #EEE8FB 0)`, display: "grid", placeItems: "center" }}>
                <div style={{ width: 118, height: 118, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center" }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 38, lineHeight: 1 }}>
                    {correct} / {total}
                    <span style={{ display: "block", fontFamily: "var(--font-atkinson), system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: "#5C5C5C", marginTop: 4 }}>{pct}%</span>
                  </span>
                </div>
              </div>
              {Array.from({ length: correct }, (_, i) => (
                <span key={`xp${i}`} style={{ position: "absolute", left: "50%", top: -6, marginLeft: -30, padding: "4px 10px", borderRadius: 999, background: "#171717", color: "#fff", fontSize: 12, fontWeight: 700, animation: `slhqRise 1.6s ease-out ${(0.2 + i * 0.35).toFixed(2)}s both` }}>+20 XP</span>
              ))}
            </div>
            <span style={{ padding: "6px 14px", borderRadius: 999, background: passed ? "#E9F8EF" : "#F4EFFF", color: passed ? "#13703D" : "#4F0FB0", fontSize: 13, fontWeight: 700 }}>
              {passed ? `Passed · pass mark ${PASS_MARK}%` : `Not yet · pass mark ${PASS_MARK}%`}
            </span>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#4A4A4A" }}>
              {passed ? "Great work. In the full programme you’d unlock the next module now." : "Close! Review the explanations, then try again. Every attempt counts."}
            </p>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={reset} style={{ width: "100%", minHeight: 48, border: "1.5px solid #171717", borderRadius: 10, background: "#fff", color: "#171717", font: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Try again</button>
            <A href={ctaHref} className="mcc-btn" style={{ width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 10, background: "#6717DE", color: "#fff", fontSize: 15, fontWeight: 700 }}>{ctaLabel}</A>
          </div>
        )}
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
          <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px,4.6cqw,56px)", lineHeight: 1.04, letterSpacing: "-0.01em", textWrap: "balance" }}>{str(data, "headline")}</h2>
          <Lead maxWidth={520}>{str(data, "body")}</Lead>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 520 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: "flex", gap: 16, padding: 18, borderRadius: 16, background: "#FAF8FF", border: "1px solid #EEE8FB" }}>
                <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, background: "#fff", color: "#6717DE", display: "grid", placeItems: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, boxShadow: "0 1px 0 #E7E2F3" }}>{i + 1}</span>
                <span>
                  <span style={{ display: "block", fontSize: 17, fontWeight: 700 }}>{str(f, "title")}</span>
                  <span style={{ display: "block", fontSize: 15, lineHeight: 1.55, color: "#4A4A4A", marginTop: 2 }}>{str(f, "body")}</span>
                </span>
              </li>
            ))}
          </ul>
          {str(data, "hint") && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 999, background: "#171717", color: "#fff", fontSize: 15, fontWeight: 700 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: "slhqNudge 1.4s ease-in-out infinite" }}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
              {str(data, "hint")}
            </span>
          )}
        </div>
        <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 460, display: "flex", justifyContent: "center", padding: "10px 0 40px" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: "6% 4% 12%", borderRadius: 40, background: "#F4EFFF", transform: "rotate(-4deg)" }} />
            <QuizPhone ctaLabel={str(data, "cta_label") || "Get the full mock free"} ctaHref={str(data, "cta_href") || "/signup"} />
            <div aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 16, background: "#fff", boxShadow: "0 18px 36px -16px rgba(40,10,100,.4)", fontSize: 13, animation: "slhqFloat 5s ease-in-out infinite" }}>
              <span style={{ width: 40, height: 40, borderRadius: "50%", background: "conic-gradient(#6B26FF 0 60%,#EEE8FB 60% 100%)", display: "grid", placeItems: "center" }}><span style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff" }} /></span>
              <span><span style={{ display: "block", fontWeight: 700 }}>Module 3 test</span><span style={{ display: "block", color: "#5C5C5C", fontSize: 12 }}>Pass mark 60%</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
