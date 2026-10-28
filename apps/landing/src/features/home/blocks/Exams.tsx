"use client";

import { useState } from "react";
import { bool, list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Arrow, DISPLAY, Eyebrow, Lead, Section } from "../ui";

type Tone = { bg: string; border: string; fg: string; sub: string; chipBg: string; chipFg: string; wm: string; ring: string; arrowBg: string; arrowFg: string };

const TONES: Record<string, Tone> = {
  violet: { bg: "#6717DE", border: "#6717DE", fg: "#FFFFFF", sub: "#EFE7FF", chipBg: "rgba(255,255,255,.16)", chipFg: "#FFFFFF", wm: "rgba(255,255,255,.09)", ring: "rgba(255,255,255,.25)", arrowBg: "#FFFFFF", arrowFg: "#4F0FB0" },
  ink: { bg: "#171717", border: "#171717", fg: "#FFFFFF", sub: "#D4D4D4", chipBg: "#2A2A2A", chipFg: "#FFFFFF", wm: "rgba(255,255,255,.07)", ring: "rgba(255,255,255,.15)", arrowBg: "#6B26FF", arrowFg: "#FFFFFF" },
  lilac: { bg: "#EFE7FF", border: "#EFE7FF", fg: "#171717", sub: "#4A4A4A", chipBg: "#FFFFFF", chipFg: "#4F0FB0", wm: "rgba(107,38,255,.09)", ring: "#FFFFFF", arrowBg: "#6717DE", arrowFg: "#FFFFFF" },
  white: { bg: "#FFFFFF", border: "#E7E2F3", fg: "#171717", sub: "#4A4A4A", chipBg: "#F4EFFF", chipFg: "#4F0FB0", wm: "rgba(107,38,255,.06)", ring: "#F4EFFF", arrowBg: "#F4EFFF", arrowFg: "#6717DE" },
};

/** Content published before tones existed has none: the first two exams are the big dark cards, the rest alternate. */
const FALLBACK_TONES = ["violet", "ink", "lilac", "white", "lilac", "white"];

const subjectsOf = (e: FieldData) => str(e, "subjects").split(",").map((s) => s.trim()).filter(Boolean);

export function Exams({ data, blockId }: { data: FieldData; blockId: string }) {
  const [query, setQuery] = useState("");
  const exams = list(data, "exams");
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searching = words.length > 0;
  const shown = searching
    ? exams.filter((e) => {
        const hay = [str(e, "code"), str(e, "name"), str(e, "note"), str(e, "tags"), str(e, "subjects")].join(" ").toLowerCase();
        return words.some((w) => hay.includes(w));
      })
    : exams;
  const hasBig = exams.some((e) => "big" in e);

  return (
    <Section id="exams" blockId={blockId} background="#FAF8FF" pad="clamp(64px,8cqw,104px) clamp(20px,5cqw,56px)" gap={28}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
          <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
          <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px,4.6cqw,56px)", lineHeight: 1.04, letterSpacing: "-0.01em", textWrap: "balance" }}>
            {str(data, "headline")}
            {str(data, "sticker") && (
              <>
                {" "}
                <span style={{ display: "inline-block", transform: "rotate(-4deg)", padding: "2px 14px", borderRadius: 999, background: "#6717DE", color: "#fff", fontSize: ".5em", verticalAlign: "middle" }}>{str(data, "sticker")}</span>
              </>
            )}
          </h2>
          <Lead>{str(data, "body")}</Lead>
        </div>
        {str(data, "cta_label") && (
          <A href={str(data, "cta_href")} className="mcc-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48, fontSize: 16, fontWeight: 700, color: "#6717DE", textDecoration: "none" }}>
            {str(data, "cta_label")}
            <Arrow />
          </A>
        )}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "0 20px", borderRadius: 10, background: "#fff", border: "1.5px solid #E2DAF3", maxWidth: 560, color: "#5C5C5C" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exams and subjects"
          placeholder="Search an exam or subject, e.g. JAMB Physics"
          style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", font: "inherit", fontSize: 16, color: "#171717" }}
        />
      </label>
      <div className="mcc-exam-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 16 }}>
        {shown.map((e, i) => {
          const position = exams.indexOf(e);
          const big = !searching && (hasBig ? bool(e, "big") : position < 2);
          const t = TONES[str(e, "tone")] ?? TONES[FALLBACK_TONES[position % FALLBACK_TONES.length]];
          const subjects = subjectsOf(e);
          const code = str(e, "code");
          const logo = str(e, "logo_url");
          return (
            <A
              key={`${code}-${i}`}
              href={str(e, "href")}
              className={`mcc-exam-card mcc-exam-tile${big ? " mcc-exam-big" : ""}`}
              style={{
                gridColumn: big ? "span 3" : "span 2", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 16,
                minHeight: big ? 320 : 230, padding: "clamp(18px,2cqw,26px)", borderRadius: 16, background: t.bg, border: `1.5px solid ${t.border}`,
                textDecoration: "none", color: t.fg,
              }}
            >
              <span aria-hidden="true" className="mcc-exam-wm" style={{ position: "absolute", right: -8, bottom: "-0.22em", fontFamily: DISPLAY, fontWeight: 800, fontSize: big ? 200 : 110, lineHeight: 1, letterSpacing: "-0.03em", color: t.wm, pointerEvents: "none", whiteSpace: "nowrap" }}>{code}</span>
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: big ? 64 : 52, height: big ? 64 : 52, flex: "none", borderRadius: "50%", background: "#fff", color: "#6717DE", overflow: "hidden", boxShadow: `0 0 0 3px ${t.ring}`, display: "grid", placeItems: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: big ? 20 : 16 }}>
                  {logo ? <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : code.slice(0, 2).toUpperCase()}
                </span>
                <span style={{ width: 40, height: 40, flex: "none", borderRadius: "50%", background: t.arrowBg, color: t.arrowFg, display: "grid", placeItems: "center" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
                </span>
              </div>
              <div style={{ position: "relative", marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="mcc-exam-code" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: big ? 64 : 34, lineHeight: 1, letterSpacing: "-0.015em", color: t.fg }}>{code}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: t.fg }}>{str(e, "name")}</span>
                <span style={{ fontSize: 14, color: t.sub }}>{str(e, "note")}</span>
              </div>
              {subjects.length > 0 && (
                <div className="mcc-exam-chips" style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {subjects.slice(0, big ? 5 : 2).map((s) => (
                    <span key={s} style={{ padding: "5px 10px", borderRadius: 999, background: t.chipBg, color: t.chipFg, fontSize: 13, fontWeight: 700 }}>{s}</span>
                  ))}
                </div>
              )}
            </A>
          );
        })}
      </div>
      {shown.length === 0 && (
        <p style={{ margin: 0, fontSize: 16, color: "#404040" }}>
          No match yet. <a href="#contact" style={{ color: "#6717DE", fontWeight: 700 }}>Tell us what you&apos;re studying</a> and we&apos;ll point you the right way.
        </p>
      )}
      {str(data, "footnote") && <p style={{ margin: 0, fontSize: 14, color: "#5C5C5C" }}>{str(data, "footnote")}</p>}
    </Section>
  );
}
