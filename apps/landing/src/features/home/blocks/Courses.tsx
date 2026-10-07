"use client";

import { useState } from "react";
import { bool, list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, DISPLAY, Eyebrow, H2, Lead, Section } from "../ui";

type Filter = "All" | "Free" | "Paid";

export function Courses({ data, blockId }: { data: FieldData; blockId: string }) {
  const [filter, setFilter] = useState<Filter>("All");
  const courses = list(data, "courses");
  const shown = courses.filter((c) => filter === "All" || (filter === "Free") === bool(c, "free"));
  const hasFree = courses.some((c) => bool(c, "free"));
  const hasPaid = courses.some((c) => !bool(c, "free"));
  const chips: Filter[] = hasFree && hasPaid ? ["All", "Free", "Paid"] : [];

  return (
    <Section id="courses" blockId={blockId} background="#fff" gap={32}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
          <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
          <H2>{str(data, "headline")}</H2>
          <Lead>{str(data, "body")}</Lead>
        </div>
        {chips.length > 0 && (
          <div role="group" aria-label="Filter courses" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {chips.map((c) => {
              const active = c === filter;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(c)}
                  className={active ? undefined : "mcc-chip"}
                  style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, border: `1.5px solid ${active ? "#171717" : "#E2DAF3"}`, background: active ? "#171717" : "#fff", color: active ? "#fff" : "#171717", font: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: 20 }}>
        {shown.map((c, i) => {
          const free = bool(c, "free");
          const cover = str(c, "image_url");
          return (
            <A key={i} href={str(c, "href")} className="mcc-card" style={{ display: "flex", flexDirection: "column", borderRadius: 28, border: "1.5px solid #EEE8FB", background: "#fff", overflow: "hidden", textDecoration: "none", color: "#171717" }}>
              <div style={{ position: "relative", height: 160, background: "#F4EFFF", display: "flex", alignItems: "flex-end", padding: 18, overflow: "hidden" }}>
                {cover ? (
                  <img src={cover} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <span style={{ position: "absolute", right: -20, top: -30, width: 150, height: 150, borderRadius: "50%", background: "#EADFFF" }} />
                    <span style={{ position: "relative", fontFamily: DISPLAY, fontSize: 30, lineHeight: 1, color: "#4F0FB0" }}>{str(c, "glyph")}</span>
                  </>
                )}
                <span style={{ position: "absolute", left: 16, top: 16, padding: "5px 12px", borderRadius: 999, background: free ? "#E9F8EF" : "#6717DE", color: free ? "#13703D" : "#fff", fontSize: 12, fontWeight: 700, letterSpacing: ".04em" }}>
                  {free ? "FREE" : "PAID"}
                </span>
              </div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", color: "#6717DE" }}>{str(c, "category")}</span>
                <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.3, fontWeight: 700 }}>{str(c, "title")}</h3>
                {str(c, "byline") && <span style={{ fontSize: 14, color: "#5C5C5C" }}>{str(c, "byline")}</span>}
                <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F2EEF8" }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{free ? "Free" : str(c, "price_label")}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#6717DE" }}>View course</span>
                </div>
              </div>
            </A>
          );
        })}
      </div>
      {str(data, "cta_label") && (
        <A href={str(data, "cta_href")} className="mcc-btn mcc-btn-dark" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 24px", borderRadius: 999, border: "1.5px solid #171717", color: "#171717", fontSize: 16, fontWeight: 600 }}>
          {str(data, "cta_label")}
        </A>
      )}
    </Section>
  );
}
