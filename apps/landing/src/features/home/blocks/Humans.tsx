import { str, strings } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { Intro, Pill, Section } from "../ui";

/** A card's photo, or a soft purple panel when none has been added. */
function Photo({ src }: { src: string }) {
  return (
    <div style={{ height: "clamp(200px,24cqw,280px)", position: "relative", background: "linear-gradient(135deg,#EADFFF,#F4EFFF)", overflow: "hidden" }}>
      {src ? (
        <img src={src} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span aria-hidden="true" style={{ position: "absolute", right: -30, bottom: -50, width: 220, height: 220, borderRadius: "50%", background: "rgba(107,38,255,.12)" }} />
      )}
    </div>
  );
}

const cardBody = { padding: "clamp(22px,3cqw,32px)", display: "flex", flexDirection: "column" as const, gap: 14, flex: 1 };
const status = { marginTop: "auto", display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, background: "#FAF8FF", border: "1px solid #EEE8FB" };
const title = { margin: 0, fontSize: "clamp(22px,2.4cqw,28px)", lineHeight: 1.2, fontWeight: 700 };

export function Humans({ data, blockId }: { data: FieldData; blockId: string }) {
  const trust = strings(data, "trust");
  return (
    <Section id="teachers" blockId={blockId} background="#F6F1FF" gap={40}>
      <Intro eyebrow={str(data, "eyebrow")} headline={str(data, "headline")} body={str(data, "body")} maxWidth={660} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 20 }}>
        <article style={{ display: "flex", flexDirection: "column", borderRadius: 32, background: "#fff", overflow: "hidden" }}>
          <Photo src={str(data, "call_image_url")} />
          <div style={cardBody}>
            <Pill style={{ alignSelf: "flex-start", background: "#E9F8EF", color: "#13703D" }}>FREE · RIGHT AFTER SIGN-UP</Pill>
            <h3 style={title}>{str(data, "call_title")}</h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#4A4A4A" }}>{str(data, "call_body")}</p>
            <div style={status} aria-hidden="true">
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: "#EADFFF", color: "#4F0FB0", display: "grid", placeItems: "center", fontWeight: 700, flex: "none" }}>A</span>
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontWeight: 700, fontSize: 15 }}>Call with Amaka</span><span style={{ display: "block", fontSize: 13, color: "#5C5C5C" }}>Customer Relations · Tomorrow, 10:00am</span></span>
              <span style={{ padding: "6px 12px", borderRadius: 999, background: "#6717DE", color: "#fff", fontSize: 12, fontWeight: 700 }}>Booked</span>
            </div>
          </div>
        </article>
        <article style={{ display: "flex", flexDirection: "column", borderRadius: 32, background: "#fff", overflow: "hidden" }}>
          <Photo src={str(data, "class_image_url")} />
          <div style={cardBody}>
            <Pill style={{ alignSelf: "flex-start", background: "#F4EFFF", color: "#4F0FB0" }}>EVERY WEEK · LIVE</Pill>
            <h3 style={title}>{str(data, "class_title")}</h3>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#4A4A4A" }}>{str(data, "class_body")}</p>
            <div style={status} aria-hidden="true">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: "#FDECEC", color: "#9B1C1C", fontSize: 12, fontWeight: 700, flex: "none" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626" }} />LIVE</span>
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontWeight: 700, fontSize: 15 }}>Chemistry with Mrs. Okafor</span><span style={{ display: "block", fontSize: 13, color: "#5C5C5C" }}>Thursdays · 4:00pm</span></span>
              <span style={{ padding: "6px 12px", borderRadius: 999, background: "#171717", color: "#fff", fontSize: 12, fontWeight: 700 }}>Join</span>
            </div>
          </div>
        </article>
      </div>
      {trust.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", fontSize: 15, fontWeight: 500, color: "#404040" }}>
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
