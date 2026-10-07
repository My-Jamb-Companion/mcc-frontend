"use client";

import { useState } from "react";
import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Arrow, DISPLAY, Eyebrow, H2, Lead, Section } from "../ui";

export function Exams({ data, blockId }: { data: FieldData; blockId: string }) {
  const [query, setQuery] = useState("");
  const exams = list(data, "exams");
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = words.length
    ? exams.filter((e) => {
        const hay = [str(e, "code"), str(e, "name"), str(e, "note"), str(e, "tags")].join(" ").toLowerCase();
        return words.some((w) => hay.includes(w));
      })
    : exams;

  return (
    <Section id="exams" blockId={blockId} background="#FAF8FF" border pad="clamp(64px,8cqw,104px) clamp(20px,5cqw,56px)" gap={32}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
          <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
          <H2>{str(data, "headline")}</H2>
          <Lead>{str(data, "body")}</Lead>
        </div>
        {str(data, "cta_label") && (
          <A href={str(data, "cta_href")} className="mcc-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48, fontSize: 16, fontWeight: 600, color: "#6717DE", textDecoration: "none" }}>
            {str(data, "cta_label")}
            <Arrow />
          </A>
        )}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "0 20px", borderRadius: 999, background: "#fff", border: "1.5px solid #E2DAF3", maxWidth: 560, color: "#5C5C5C" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exams and subjects"
          placeholder="Search an exam or subject, e.g. JAMB Physics"
          style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", font: "inherit", fontSize: 16, color: "#171717" }}
        />
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(max(140px,calc((100% - 48px) / 4)),1fr))", gap: 16 }}>
        {shown.map((e, i) => (
          <A key={`${str(e, "code")}-${i}`} href={str(e, "href")} className="mcc-card mcc-exam" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24, minHeight: 156, padding: 20, borderRadius: 24, background: "#fff", border: "1.5px solid #E7E2F3", textDecoration: "none", color: "#171717" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,2.8cqw,36px)", lineHeight: 1, letterSpacing: "-0.01em" }}>{str(e, "code")}</span>
              <span style={{ width: 36, height: 36, flex: "none", borderRadius: "50%", background: "#F4EFFF", color: "#6717DE", display: "grid", placeItems: "center" }}><Arrow size={16} width={2.4} /></span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{str(e, "name")}</div>
              <div style={{ fontSize: 13, color: "#5C5C5C", marginTop: 4 }}>{str(e, "note")}</div>
            </div>
          </A>
        ))}
      </div>
      {shown.length === 0 && (
        <p style={{ margin: 0, fontSize: 16, color: "#404040" }}>
          No match yet. <a href="#contact" style={{ color: "#6717DE", fontWeight: 600 }}>Tell us what you&apos;re studying</a> and we&apos;ll point you the right way.
        </p>
      )}
    </Section>
  );
}
