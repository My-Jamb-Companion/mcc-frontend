"use client";

import { useState } from "react";
import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Eyebrow, H2 } from "../ui";

export function Faq({ data, blockId }: { data: FieldData; blockId: string }) {
  const [open, setOpen] = useState(0);
  const items = list(data, "items");
  return (
    <section id="faq" data-block-id={blockId} style={{ containerType: "inline-size", background: "#FAF8FF", borderTop: "1px solid #EEEAF5", color: "#171717" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(64px,8cqw,112px) clamp(20px,5cqw,56px)", display: "flex", flexWrap: "wrap", gap: "clamp(32px,5cqw,72px)", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
          <H2>{str(data, "headline")}</H2>
          {str(data, "body") && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#4A4A4A" }}>{str(data, "body")}</p>}
          {str(data, "cta_label") && (
            <A href={str(data, "cta_href")} className="mcc-btn mcc-btn-dark" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", minHeight: 48, padding: "0 20px", borderRadius: 999, border: "1.5px solid #171717", color: "#171717", fontSize: 15, fontWeight: 600 }}>
              {str(data, "cta_label")}
            </A>
          )}
        </div>
        <div style={{ flex: "2 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((q, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderRadius: 22, background: "#fff", border: "1px solid #EEE8FB" }}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{ width: "100%", minHeight: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 22px", border: 0, background: "transparent", font: "inherit", fontSize: 17, fontWeight: 600, color: "#171717", textAlign: "left", cursor: "pointer" }}
                >
                  {str(q, "q")}
                  <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", background: "#F4EFFF", color: "#6717DE", display: "grid", placeItems: "center", transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                  </span>
                </button>
                {isOpen && <p style={{ margin: 0, padding: "0 22px 20px", fontSize: 16, lineHeight: 1.6, color: "#404040", maxWidth: 640 }}>{str(q, "a")}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
