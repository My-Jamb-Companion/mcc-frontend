import { str, strings } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { DISPLAY, Eyebrow, Lead, Section } from "../ui";

const raised = { position: "absolute" as const, pointerEvents: "none" as const, background: "#fff", boxShadow: "0 16px 34px -16px rgba(40,10,100,.5)" };
const pill = (bg: string, fg: string) => ({ alignSelf: "flex-start" as const, padding: "5px 12px", borderRadius: 999, background: bg, color: fg, fontSize: 12, fontWeight: 700, letterSpacing: ".04em" });
const cardTitle = { margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(24px,2.6cqw,30px)", lineHeight: 1.15 };
const cardText = { margin: 0, fontSize: 16, lineHeight: 1.6, color: "#4A4A4A" };
const chip = { padding: "3px 9px", borderRadius: 999, background: "#F4EFFF", color: "#4F0FB0", fontSize: 12, fontWeight: 700 };

/** A card's photo, or a soft purple panel when none has been added. */
function Photo({ src, children }: { src: string; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", aspectRatio: "5/4", background: "#EADFFF", overflow: "hidden" }}>
      {src && <img src={src} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      {children}
    </div>
  );
}

/** Real people: the free onboarding call and the weekly live class, each a photo with little floating cards over it. */
export function Humans({ data, blockId }: { data: FieldData; blockId: string }) {
  const trust = strings(data, "trust");
  return (
    <Section id="teachers" blockId={blockId} background="#F6F1FF" gap={40}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
        <Eyebrow>{str(data, "eyebrow")}</Eyebrow>
        <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px,4.8cqw,60px)", lineHeight: 1.02, letterSpacing: "-0.01em", textWrap: "balance" }}>{str(data, "headline")}</h2>
        <Lead>{str(data, "body")}</Lead>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: 20 }}>
        <article style={{ display: "flex", flexDirection: "column", borderRadius: 16, background: "#fff", overflow: "hidden" }}>
          <Photo src={str(data, "call_image_url")}>
            <div aria-hidden="true" style={{ ...raised, left: 16, top: 16, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px 12px 12px", borderRadius: 16, animation: "slhqFloat 5s ease-in-out infinite" }}>
              <span style={{ position: "relative", width: 40, height: 40, flex: "none" }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#16A34A", animation: "slhqPulse 1.8s ease-out infinite" }} />
                <span style={{ position: "relative", display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: "50%", background: "#16A34A", color: "#fff" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" /></svg>
                </span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Amaka is calling<span style={{ display: "block", fontWeight: 400, fontSize: 13, color: "#5C5C5C" }}>Your free onboarding call</span></span>
            </div>
            <div aria-hidden="true" style={{ ...raised, right: 16, bottom: 16, width: "min(230px,60%)", padding: 14, borderRadius: 16, display: "flex", flexDirection: "column", gap: 8, animation: "slhqFloat 6s ease-in-out 1.2s infinite" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "#6717DE" }}>YOUR PLAN</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>JAMB · Science track</span>
              <span style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{["English", "Physics", "Chemistry"].map((s) => <span key={s} style={chip}>{s}</span>)}</span>
            </div>
          </Photo>
          <div style={{ padding: "clamp(22px,3cqw,32px)", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <span style={pill("#E9F8EF", "#13703D")}>FREE · RIGHT AFTER SIGN-UP</span>
            <h3 style={cardTitle}>{str(data, "call_title")}</h3>
            <p style={cardText}>{str(data, "call_body")}</p>
          </div>
        </article>
        <article style={{ display: "flex", flexDirection: "column", borderRadius: 16, background: "#fff", overflow: "hidden" }}>
          <Photo src={str(data, "class_image_url")}>
            <div aria-hidden="true" style={{ ...raised, left: 16, top: 16, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 16, animation: "slhqFloat 5.5s ease-in-out .4s infinite" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 999, background: "#9B1C1C", color: "#fff", fontSize: 11, fontWeight: 700 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />LIVE</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Chemistry with Mrs. Okafor</span>
            </div>
            <div aria-hidden="true" style={{ ...raised, left: 16, bottom: 72, maxWidth: "min(64%,300px)", padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "#6717DE", color: "#fff", fontSize: 14, lineHeight: 1.4, boxShadow: "0 16px 34px -16px rgba(40,10,100,.6)", animation: "slhqFloat 6s ease-in-out 1.6s infinite" }}>
              <b style={{ display: "block", fontSize: 12 }}>Chidi</b>Ma, please explain the mole concept again
            </div>
            <div aria-hidden="true" style={{ ...raised, right: 16, bottom: 16, display: "flex", alignItems: "center", padding: 6, borderRadius: 999 }}>
              {[["T", "#EADFFF", "#4F0FB0"], ["C", "#171717", "#fff"], ["A", "#6717DE", "#fff"]].map(([l, bg, fg], k) => (
                <span key={l} style={{ width: 30, height: 30, marginLeft: k ? -8 : 0, borderRadius: "50%", background: bg, color: fg, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, border: "2px solid #fff" }}>{l}</span>
              ))}
              <span style={{ padding: "0 8px", fontSize: 12, fontWeight: 700 }}>Raise hand</span>
            </div>
          </Photo>
          <div style={{ padding: "clamp(22px,3cqw,32px)", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <span style={pill("#F4EFFF", "#4F0FB0")}>EVERY WEEK · LIVE</span>
            <h3 style={cardTitle}>{str(data, "class_title")}</h3>
            <p style={cardText}>{str(data, "class_body")}</p>
          </div>
        </article>
      </div>
      {trust.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", fontSize: 15, color: "#404040" }}>
          {trust.map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6717DE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
              {t}
            </span>
          ))}
        </div>
      )}
    </Section>
  );
}
