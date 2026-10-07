import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, Arrow, BrandMark } from "./ui";

export function SiteFooter({ site }: { site: FieldData }) {
  const columns = list(site, "footer_columns");
  const socials = list(site, "socials").filter((s) => str(s, "href").trim() !== "");
  const letter = str(site, "logo_letter") || str(site, "brand_name").charAt(0).toLowerCase() || "m";

  // A link with no address (a page that doesn't exist yet) shows as plain text rather than a dead link.
  const item = (l: Record<string, unknown>, i: number) =>
    str(l as FieldData, "href").trim() ? (
      <A key={i} href={str(l as FieldData, "href")} className="mcc-footlink" style={{ display: "flex", alignItems: "center", minHeight: 40, fontSize: 15, color: "#EDEDED", textDecoration: "none" }}>
        {str(l as FieldData, "label")}
      </A>
    ) : (
      <span key={i} style={{ display: "flex", alignItems: "center", minHeight: 40, fontSize: 15, color: "#8A8A8A" }}>{str(l as FieldData, "label")}</span>
    );

  return (
    <footer id="contact" style={{ containerType: "inline-size", background: "#0A0A0A", color: "#EDEDED" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(56px,7cqw,88px) clamp(20px,5cqw,56px) 32px", display: "flex", flexDirection: "column", gap: 48 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 280px", maxWidth: 380, display: "flex", flexDirection: "column", gap: 18 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrandMark letter={letter} logoUrl={str(site, "logo_url")} />
              <span style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>{str(site, "brand_name")}</span>
            </span>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#BDBDBD" }}>{str(site, "footer_tagline")}</p>
            {str(site, "teach_label") && (
              <A id="teach" href={str(site, "teach_href")} className="mcc-teach" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", borderRadius: 20, background: "#17151C", border: "1px solid #2A2633", color: "#fff", textDecoration: "none" }}>
                <span>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>{str(site, "teach_label")}</span>
                  <span style={{ display: "block", fontSize: 13, color: "#A3A3A3", marginTop: 2 }}>{str(site, "teach_body")}</span>
                </span>
                <Arrow />
              </A>
            )}
          </div>
          <nav aria-label="Footer" style={{ flex: "2 1 480px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 28 }}>
            {columns.map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", color: "#A3A3A3", marginBottom: 8 }}>{str(c, "title")}</span>
                {list(c, "links").map(item)}
              </div>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 28px", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1px solid #262626", fontSize: 14, color: "#A3A3A3" }}>
          <span>{str(site, "copyright")}</span>
          {socials.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
              {socials.map((s, i) => (
                <A key={i} href={str(s, "href")} className="mcc-footlink" style={{ display: "inline-flex", alignItems: "center", minHeight: 40, color: "#EDEDED", textDecoration: "none" }}>{str(s, "label")}</A>
              ))}
            </div>
          )}
          {str(site, "currency_note") && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40, padding: "0 14px", borderRadius: 999, border: "1px solid #333", color: "#EDEDED" }}>{str(site, "currency_note")}</span>
          )}
        </div>
      </div>
    </footer>
  );
}
