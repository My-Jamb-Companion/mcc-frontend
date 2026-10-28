import { str, strings } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Button, Check, DISPLAY } from "../ui";
import { HeroPhone } from "./HeroPhone";

const GRADIENT = "linear-gradient(90deg,#6B26FF,#B40D9B)";

const float = (seconds: number, delay = 0) => ({ animation: `slhqFloat ${seconds}s ease-in-out ${delay}s infinite` });

const chip = {
  position: "absolute" as const, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px 10px 10px", borderRadius: 16,
  background: "#fff", boxShadow: "0 14px 30px -14px rgba(40,10,100,.4)", fontSize: 13, fontWeight: 700,
};
const chipSub = { display: "block", fontWeight: 400, color: "#5C5C5C", fontSize: 12 } as const;

export function Hero({ data, blockId }: { data: FieldData; blockId: string }) {
  const ticks = strings(data, "ticks");
  // Pages published before the photo existed have no such field: they get the built-in photo, and a cleared one stays empty.
  const photo = typeof data.photo_url === "string" ? data.photo_url : "/landing/hero-photo.webp";
  return (
    <section id="top" data-block-id={blockId} style={{ containerType: "inline-size", background: "#fff", color: "#171717", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(32px,5cqw,72px) clamp(20px,5cqw,56px) clamp(48px,6cqw,96px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(40px,5cqw,64px)" }}>
        <div style={{ flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 }}>
          {str(data, "eyebrow") && (
            <a href="#brainy" className="mcc-pill-link" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, background: "#F4EFFF", color: "#4F0FB0", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              <span style={{ padding: "3px 10px", borderRadius: 999, background: "#6717DE", color: "#fff", fontSize: 12 }}>New</span>
              {str(data, "eyebrow")}
            </a>
          )}
          <h1 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(46px,7cqw,86px)", lineHeight: 0.98, letterSpacing: "-0.015em", textWrap: "balance" }}>
            {str(data, "headline_lead")}{" "}
            <span style={{ background: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{str(data, "headline_emph")}</span>
          </h1>
          {str(data, "body") && (
            <p style={{ margin: 0, fontSize: "clamp(17px,1.6cqw,20px)", lineHeight: 1.55, color: "#404040", maxWidth: 540, textWrap: "pretty" }}>{str(data, "body")}</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, width: "100%" }}>
            <Button href={str(data, "cta_href")} size="lg" arrow shadow>{str(data, "cta_label")}</Button>
            {str(data, "parent_label") && <Button href={str(data, "parent_href")} tone="outline" size="lg">{str(data, "parent_label")}</Button>}
          </div>
          {str(data, "login_label") && (
            <p style={{ margin: 0, fontSize: 15, color: "#525252" }}>
              {str(data, "login_prompt")}{" "}
              <A href={str(data, "login_href")} style={{ color: "#6717DE", fontWeight: 700 }}>{str(data, "login_label")}</A>
            </p>
          )}
          {ticks.length > 0 && (
            <ul style={{ listStyle: "none", margin: "4px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "10px 20px", fontSize: 14, color: "#404040" }}>
              {ticks.map((t) => (
                <li key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#E9F8EF", color: "#13703D", display: "grid", placeItems: "center" }}><Check /></span>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ flex: "1 1 420px", minWidth: 0, position: "relative", padding: "0 0 36px clamp(36px,5cqw,72px)" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", maxHeight: 640, borderRadius: 16, overflow: "hidden", background: "#EADFFF" }}>
            {photo && <img src={photo} alt="" fetchPriority="high" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
          </div>
          <div aria-hidden="true" style={{ ...chip, left: "clamp(56px,7cqw,104px)", top: 20, ...float(5) }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6B26FF,#B40D9B)", flex: "none" }} />
            <span>Brainy made your flashcards<span style={chipSub}>From Biology notes, p.42</span></span>
          </div>
          <div aria-hidden="true" style={{ ...chip, right: 14, bottom: 110, ...float(6, 1.2) }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: "#6717DE", color: "#fff", display: "grid", placeItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>
            </span>
            <span>Live class at 4:00pm<span style={chipSub}>Chemistry · Mrs. Okafor</span></span>
          </div>
          <HeroPhone />
        </div>
      </div>
    </section>
  );
}
