import { str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Arrow, DISPLAY } from "../ui";

export function Cta({ data, blockId }: { data: FieldData; blockId: string }) {
  return (
    <section id="start" data-block-id={blockId} style={{ containerType: "inline-size", background: "#fff", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(24px,4cqw,48px) clamp(12px,3cqw,56px) clamp(48px,6cqw,88px)" }}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: "clamp(28px,4cqw,44px)", background: "linear-gradient(120deg,#6B26FF 0%,#8A1BD6 55%,#B40D9B 100%)", padding: "clamp(40px,7cqw,88px) clamp(24px,6cqw,80px)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 }}>
          <span aria-hidden="true" style={{ position: "absolute", right: -80, bottom: -120, width: 380, height: 380, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
          <span aria-hidden="true" style={{ position: "absolute", right: 120, top: -90, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <h2 style={{ position: "relative", margin: 0, fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(38px,6cqw,76px)", lineHeight: 1, letterSpacing: "-0.01em", maxWidth: 780, textWrap: "balance" }}>{str(data, "headline")}</h2>
          {str(data, "body") && <p style={{ position: "relative", margin: 0, fontSize: "clamp(17px,1.6cqw,20px)", lineHeight: 1.55, maxWidth: 560 }}>{str(data, "body")}</p>}
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 12 }}>
            <A href={str(data, "cta_href")} className="mcc-btn mcc-btn-white" style={{ display: "inline-flex", alignItems: "center", gap: 10, minHeight: 56, padding: "0 26px", borderRadius: 999, background: "#fff", color: "#4F0FB0", fontSize: 17, fontWeight: 700 }}>
              {str(data, "cta_label")}
              <Arrow />
            </A>
            {str(data, "login_label") && (
              <A href={str(data, "login_href")} className="mcc-btn mcc-btn-glass" style={{ display: "inline-flex", alignItems: "center", minHeight: 56, padding: "0 24px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,.7)", color: "#fff", fontSize: 17, fontWeight: 600 }}>
                {str(data, "login_label")}
              </A>
            )}
          </div>
          {str(data, "parent_label") && (
            <A href={str(data, "parent_href")} style={{ position: "relative", fontSize: 15, fontWeight: 600, color: "#fff", textUnderlineOffset: 4 }}>{str(data, "parent_label")}</A>
          )}
        </div>
      </div>
    </section>
  );
}
