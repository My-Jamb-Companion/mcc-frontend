import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Arrow, DISPLAY, Eyebrow, Lead, Section } from "../ui";

/** The little badge on each card's chip: green, violet, then black. */
const CHIP_COLOURS = ["#16A34A", "#6717DE", "#171717"];
const CHIP_DELAYS = ["0s", "1.4s", "2.6s"];

/** "Made for you": who the platform is for, as three photo cards that sit in a row (and scroll sideways on a phone). */
export function Audience({ data, blockId }: { data: FieldData; blockId: string }) {
  const cards = list(data, "cards");
  return (
    <Section id="for-you" blockId={blockId} background="#fff" pad="clamp(48px,6cqw,88px) clamp(20px,5cqw,56px)" gap={32}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 660 }}>
        <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
        <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px,4.6cqw,56px)", lineHeight: 1.04, letterSpacing: "-0.01em", textWrap: "balance" }}>{str(data, "headline")}</h2>
        <Lead>{str(data, "body")}</Lead>
      </div>
      <div style={{ display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", padding: "8px 0 4px" }}>
        {cards.map((c, i) => (
          <A key={i} href={str(c, "href")} className="mcc-aud-card mcc-lift" style={{ flex: "1 0 0", minWidth: 0, scrollSnapAlign: "start", display: "flex", flexDirection: "column", gap: 18, textDecoration: "none", color: "#171717" }}>
            <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", background: "#EADFFF" }}>
              {str(c, "image_url") && <img src={str(c, "image_url")} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              {str(c, "tag") && <span style={{ position: "absolute", left: 14, top: 14, padding: "6px 12px", borderRadius: 999, background: "#fff", color: "#4F0FB0", fontSize: 13, fontWeight: 700 }}>{str(c, "tag")}</span>}
              {str(c, "chip") && (
                <div aria-hidden="true" style={{ position: "absolute", left: 14, right: 14, bottom: 14, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 16, background: "#fff", boxShadow: "0 14px 30px -14px rgba(40,10,100,.45)", fontSize: 13, fontWeight: 700, animation: `slhqFloat 5s ease-in-out ${CHIP_DELAYS[i % 3]} infinite` }}>
                  <span style={{ width: 32, height: 32, flex: "none", borderRadius: 10, background: CHIP_COLOURS[i % 3], color: "#fff", display: "grid", placeItems: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <span style={{ minWidth: 0 }}>{str(c, "chip")}<span style={{ display: "block", fontWeight: 400, color: "#5C5C5C", fontSize: 12 }}>{str(c, "chip_sub")}</span></span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h3 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px,2.2cqw,26px)", lineHeight: 1.15 }}>{str(c, "title")}</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "#4A4A4A" }}>{str(c, "body")}</p>
              {str(c, "cta_label") && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, fontSize: 16, fontWeight: 700, color: "#6717DE" }}>
                  {str(c, "cta_label")}
                  <Arrow />
                </span>
              )}
            </div>
          </A>
        ))}
      </div>
    </Section>
  );
}
