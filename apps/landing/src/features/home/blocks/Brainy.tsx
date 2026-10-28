"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { list, str, strings } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Arrow, DISPLAY } from "../ui";
import { prefersReducedMotion } from "../hooks/useCycle";
import { useNarrow } from "../hooks/useContainerWidth";
import { useScrollPanels } from "../hooks/useScrollPanels";

const DEFAULT_PANELS = [
  { short: "Ask", title: "Ask anything, any time", body: "Stuck at midnight? Ask Brainy and get a clear, step-by-step answer in plain English.", tags: ["Maths", "Sciences", "English", "Any subject"] },
  { short: "Snap", title: "Snap or upload your notes", body: "Snap a photo of a textbook page, upload a PDF, Word file or slides, paste text or record a voice note.", tags: ["PDF", "Word", "PowerPoint", "Photo", "Voice note"] },
  { short: "Flashcards", title: "Get flashcards and quizzes", body: "Brainy turns your notes into study sets: flashcards and quick quizzes, ready when you are.", tags: ["Flashcards", "Quick quizzes"] },
  { short: "Remember", title: "Remember it on exam day", body: "Spaced repetition brings each card back just before you'd forget it, so revision sticks.", tags: ["Spaced repetition", "Daily review"] },
];

const View = ({ on, children, style }: { on: boolean; children: ReactNode; style?: CSSProperties }) => (
  <div
    aria-hidden={!on}
    style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", opacity: on ? 1 : 0, transform: on ? "none" : "translateY(18px) scale(.97)", transition: "opacity .45s ease, transform .45s ease", ...style }}
  >
    {children}
  </div>
);

const chipSmall = { padding: "4px 10px", borderRadius: 999, background: "#F4EFFF", color: "#4F0FB0", fontSize: 11, fontWeight: 700 } as const;
const bubble = { alignSelf: "flex-start", maxWidth: "88%", padding: "10px 12px", borderRadius: "16px 16px 16px 4px", background: "#fff", border: "1px solid #EEE8FB", lineHeight: 1.45 } as const;
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 14, background: "#fff", border: "1px solid #EEE8FB" } as const;
const day = (fill: string, ring = false): CSSProperties => ({ display: "block", margin: "4px auto 0", width: 22, height: 22, borderRadius: "50%", background: ring ? undefined : fill, border: ring ? `2px solid ${fill}` : undefined, boxSizing: "border-box" });

/** The four screens of Brainy's phone: chat, scanning notes, a flashcard that flips, and the review plan. Sample content. */
function BrainyPhone({ active, flipped }: { active: number; flipped: boolean }) {
  return (
    <div style={{ position: "relative", width: 290, height: 600, borderRadius: 44, background: "#1E1E1E", padding: 9, boxShadow: "0 30px 60px -20px rgba(0,0,0,.8)" }}>
      <div style={{ position: "relative", height: "100%", borderRadius: 36, background: "#fff", color: "#171717", overflow: "hidden", fontSize: 13 }}>
        <View on={active === 0}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 12px", borderBottom: "1px solid #F0ECF7" }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6B26FF,#B40D9B)", flex: "none" }} />
            <div><div style={{ fontWeight: 700, fontSize: 14 }}>Brainy</div><div style={{ fontSize: 11, color: "#13703D", fontWeight: 700 }}>Online</div></div>
          </div>
          <div style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: "#FAF8FF" }}>
            <div style={{ alignSelf: "flex-end", maxWidth: "84%", padding: "9px 12px", borderRadius: "16px 16px 4px 16px", background: "#6717DE", color: "#fff" }}>Mitosis vs meiosis? Explain simply</div>
            <div style={bubble}>Mitosis copies a cell: <b>2 identical</b> cells, for growth and repair.</div>
            <div style={bubble}>Meiosis mixes things up: <b>4 different</b> cells, for reproduction.</div>
            <div style={{ alignSelf: "flex-start", display: "flex", gap: 4, padding: "10px 14px", borderRadius: 16, background: "#fff", border: "1px solid #EEE8FB" }}>
              {[0, 0.2, 0.4].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6717DE", animation: `slhqDots 1.2s ${d}s infinite` }} />)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 16px", borderTop: "1px solid #F0ECF7" }}>
            <span style={{ flex: 1, padding: "10px 12px", borderRadius: 999, background: "#F5F3F8", color: "#5C5C5C", fontSize: 12 }}>Ask, paste or snap…</span>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#6717DE" }} />
          </div>
        </View>
        <View on={active === 1} style={{ background: "#1A1720", color: "#fff" }}>
          <div style={{ padding: "18px 16px 8px", fontSize: 12, fontWeight: 700, display: "flex", justifyContent: "space-between" }}><span>Snap your notes</span><span style={{ color: "#C9B2FF" }}>Photo</span></div>
          <div style={{ position: "relative", flex: 1, margin: "4px 16px", display: "grid", placeItems: "center" }}>
            <div style={{ width: "82%", height: "82%", background: "#FBFAF6", borderRadius: 6, transform: "rotate(-3deg)", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 9, boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: 14, color: "#1E3A8A", fontWeight: 700 }}>Cell division</span>
              {[92, 80, 88, 60].map((w) => <span key={w} style={{ height: 2, width: `${w}%`, background: "#9DB0D8" }} />)}
              <span style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#1E3A8A" }}>Mitosis → 2 cells</span>
              {[84, 70].map((w) => <span key={w} style={{ height: 2, width: `${w}%`, background: "#9DB0D8" }} />)}
              <span style={{ fontFamily: "Georgia,serif", fontSize: 12, color: "#1E3A8A" }}>Meiosis → 4 cells</span>
              <span style={{ height: 2, width: "76%", background: "#9DB0D8" }} />
            </div>
            <span style={{ position: "absolute", left: "4%", right: "4%", height: 3, borderRadius: 3, background: "#B79CFF", boxShadow: "0 0 18px 4px rgba(183,156,255,.7)", animation: "slhqScan 2.6s ease-in-out infinite" }} />
            {[{ left: 0, top: 0, b: "borderLeft borderTop", r: "6px 0 0 0" }, { right: 0, top: 0, b: "borderRight borderTop", r: "0 6px 0 0" }, { left: 0, bottom: 0, b: "borderLeft borderBottom", r: "0 0 0 6px" }, { right: 0, bottom: 0, b: "borderRight borderBottom", r: "0 0 6px 0" }].map((c, k) => (
              <span key={k} style={{ position: "absolute", width: 26, height: 26, borderRadius: c.r, left: c.left, right: c.right, top: c.top, bottom: c.bottom, ...Object.fromEntries(c.b.split(" ").map((side) => [side, "3px solid #fff"])) }} />
            ))}
          </div>
          <div style={{ margin: 12, padding: 14, borderRadius: 16, background: "#fff", color: "#171717", display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{active === 1 ? "Reading your notes…" : "Ready to scan"}</span>
            <span style={{ display: "block", height: 6, borderRadius: 6, background: "#EEE8FB", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: active === 1 ? "100%" : "8%", background: "#6B26FF", transition: "width 2.4s ease" }} />
            </span>
            <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["PDF", "Word", "Slides", "Voice"].map((t) => <span key={t} style={chipSmall}>{t}</span>)}</span>
          </div>
        </View>
        <View on={active === 2} style={{ gap: 14, padding: "22px 16px 18px", background: "#FAF8FF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#6717DE" }}><span>BIOLOGY · CELLS</span><span style={{ color: "#5C5C5C" }}>3 / 12</span></div>
          <div style={{ flex: 1, perspective: 900 }}>
            <div style={{ position: "relative", height: "100%", transformStyle: "preserve-3d", transform: active === 2 && flipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform .7s cubic-bezier(.3,.7,.3,1)" }}>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: 18, background: "#6717DE", color: "#fff", padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em" }}>QUESTION</span>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, lineHeight: 1.08 }}>What does mitosis produce?</span>
                <span style={{ fontSize: 12 }}>Tap to flip</span>
              </div>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 18, background: "#fff", border: "2px solid #6B26FF", padding: 22, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#6717DE" }}>ANSWER</span>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, lineHeight: 1.1 }}>Two identical daughter cells.</span>
                <span style={{ fontSize: 12, color: "#5C5C5C" }}>From your notes, p.42</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
            {[["Again", "1 min", "#F5F3F8", undefined], ["Good", "1 day", "#F4EFFF", "#4F0FB0"], ["Easy", "4 days", "#E9F8EF", "#13703D"]].map(([label, when, bg, fg]) => (
              <span key={label} style={{ padding: "8px 0", borderRadius: 10, background: bg, color: fg }}>{label}<span style={{ display: "block", fontWeight: 400, fontSize: 10 }}>{when}</span></span>
            ))}
          </div>
        </View>
        <View on={active === 3} style={{ gap: 12, padding: "22px 14px 18px", background: "#FAF8FF" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", color: "#6717DE" }}>REVIEW PLAN</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, marginTop: 2 }}>14 cards due today</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, textAlign: "center", fontSize: 10, color: "#5C5C5C" }}>
            {[["M", "#6717DE"], ["T", "#6717DE"], ["W", "#6717DE"], ["T", "#6717DE", true], ["F", "#EEE8FB"], ["S", "#EEE8FB"], ["S", "#EEE8FB"]].map(([d, c, ring], k) => (
              <span key={k} style={ring ? { color: "#171717", fontWeight: 700 } : undefined}>{d}<span style={day(c as string, !!ring)} /></span>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[["Cell division", "Biology · 6 due", true], ["Organic chemistry", "Chemistry · 5 due", false], ["Comprehension", "English · 3 due", false]].map(([name, sub, now]) => (
              <div key={name as string} style={row}>
                <span><b>{name}</b><span style={{ display: "block", fontSize: 11, color: "#5C5C5C" }}>{sub}</span></span>
                <span style={{ padding: "4px 10px", borderRadius: 999, background: now ? "#6717DE" : "#F4EFFF", color: now ? "#fff" : "#4F0FB0", fontSize: 11, fontWeight: 700 }}>{now ? "Review" : "Later"}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "auto", padding: 12, borderRadius: 14, background: "#E9F8EF", color: "#0F5B2E", fontWeight: 700, fontSize: 12 }}>You remembered 4 of 5 yesterday</div>
        </View>
      </div>
    </div>
  );
}

const youTubeId = (url: string) => /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url)?.[1];

/** A poster that turns into the video only when tapped, so nothing downloads in the background. */
function Demo({ poster, video, label }: { poster: string; video: string; label: string }) {
  const [playing, setPlaying] = useState(false);
  const yt = youTubeId(video);
  return (
    <div style={{ position: "relative", flex: "1 1 360px", maxWidth: 560, aspectRatio: "16/9", borderRadius: 16, overflow: "hidden", background: "#17151C", color: "#C9B2FF" }}>
      {playing ? (
        yt ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1`} title={label} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
        ) : (
          <video src={video} controls autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        )
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={label} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, border: 0, background: "transparent", cursor: "pointer" }}>
          {poster && <img src={poster} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
          <span style={{ position: "absolute", left: 16, bottom: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 8px", borderRadius: 999, background: "#fff", color: "#171717", fontSize: 14, fontWeight: 700 }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#6717DE", display: "grid", placeItems: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
            </span>
            {label}
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * Brainy: a dark section with a phone that stays in view while four short texts scroll past, and the phone's screen follows
 * the text being read (chat, scanning notes, flashcards, review plan). On a narrow screen the four are tabs under the phone,
 * and the phone follows how far the visitor has scrolled. A click picks one and holds it for a few seconds.
 */
export function Brainy({ data, blockId }: { data: FieldData; blockId: string }) {
  const [section, setSection] = useState<HTMLElement | null>(null);
  const compact = useNarrow(section, 760);
  const [flipped, setFlipped] = useState(false);

  const fromData = list(data, "panels").map((p) => ({ short: str(p, "short"), title: str(p, "title"), body: str(p, "body"), tags: strings(p, "tags") }));
  const panels = fromData.length ? fromData.slice(0, 4) : DEFAULT_PANELS;
  const count = panels.length;
  const { active, pick, stage, panelRefs } = useScrollPanels(count, compact);
  const poster = str(data, "demo_poster_url");
  const video = str(data, "demo_video_url");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = setInterval(() => setFlipped((f) => !f), 1900);
    return () => clearInterval(timer);
  }, []);

  const current = panels[Math.min(active, count - 1)];

  return (
    <section ref={setSection} id="brainy" data-block-id={blockId} style={{ containerType: "inline-size", background: "#0A0A0A", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(64px,8cqw,112px) clamp(20px,5cqw,56px)", display: "flex", flexDirection: "column", gap: "clamp(28px,4cqw,48px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: "#C9B2FF" }}>
            <span style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#6B26FF,#B40D9B)" }} />
            {str(data, "eyebrow")}
          </span>
          <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px,5.6cqw,68px)", lineHeight: 1, letterSpacing: "-0.015em", textWrap: "balance" }}>{str(data, "headline")}</h2>
          {str(data, "body") && <p style={{ margin: 0, fontSize: "clamp(16px,1.5cqw,18px)", lineHeight: 1.6, color: "#C7C7C7", maxWidth: 560, textWrap: "pretty" }}>{str(data, "body")}</p>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr)", gap: "clamp(32px,5cqw,80px)", alignItems: "start" }}>
          {!compact && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {panels.map((p, k) => {
                const on = active === k;
                return (
                  <div
                    key={k} ref={(el) => { panelRefs.current[k] = el; }} role="button" tabIndex={0} onClick={() => pick(k)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(k); } }}
                    style={{ minHeight: "clamp(320px,56vh,500px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "28px 0", borderTop: "1px solid #262626", cursor: "pointer" }}
                  >
                    <span style={{ alignSelf: "flex-start", padding: "5px 12px", borderRadius: 999, background: on ? "#6717DE" : "#1C1A22", color: "#fff", fontSize: 13, fontWeight: 700, transition: "background .4s" }}>{`0${k + 1}`}</span>
                    <h3 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,3.2cqw,40px)", lineHeight: 1.05, color: on ? "#FFFFFF" : "#8A8A8A", transition: "color .4s" }}>{p.title}</h3>
                    <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, maxWidth: 460, color: on ? "#C7C7C7" : "#8A8A8A", transition: "color .4s" }}>{p.body}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {p.tags.map((t) => <span key={t} style={{ display: "inline-flex", alignItems: "center", minHeight: 34, padding: "0 12px", borderRadius: 999, background: "#1C1A22", border: "1px solid #2E2A38", fontSize: 14, color: "#EDEDED" }}>{t}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={stage} style={{ position: compact ? "relative" : "sticky", top: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, minWidth: 0 }}>
            {compact && (
              <div role="tablist" aria-label="Brainy features" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {panels.map((p, k) => (
                  <button key={k} type="button" role="tab" aria-selected={active === k} onClick={() => pick(k)} style={{ minHeight: 44, padding: "0 14px", borderRadius: 999, border: "1px solid #2E2A38", background: active === k ? "#6717DE" : "#1C1A22", color: "#fff", font: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .3s" }}>{p.short || p.title}</button>
                ))}
              </div>
            )}
            <div aria-hidden="true" style={{ position: "relative", zoom: compact ? 0.82 : 1 }}>
              <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(107,38,255,.42),transparent)" }} />
              <div style={{ position: "relative" }}><BrainyPhone active={active} flipped={flipped} /></div>
            </div>
            {compact && current && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420, minHeight: 130 }}>
                <h3 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, lineHeight: 1.1 }}>{current.title}</h3>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "#C7C7C7" }}>{current.body}</p>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
          {video && <Demo poster={poster} video={video} label={str(data, "demo_label") || "Watch Brainy in action"} />}
          <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            {video && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#C7C7C7", maxWidth: 380 }}>The video plays only when you tap it, so it won’t use your data in the background.</p>}
            {str(data, "cta_label") && (
              <A href={str(data, "cta_href")} className="mcc-btn mcc-btn-white" style={{ display: "inline-flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 24px", borderRadius: 10, background: "#fff", color: "#4F0FB0", fontSize: 16, fontWeight: 700 }}>
                {str(data, "cta_label")}
                <Arrow />
              </A>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
