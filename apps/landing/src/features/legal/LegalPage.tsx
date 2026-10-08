import "../home/landing.css";
import { SiteFooter } from "../home/SiteFooter";
import { SiteHeader } from "../home/SiteHeader";
import { getLandingContent } from "../home/content";
import { DOCUMENTS, LEGAL_LINKS } from "./documents";
import type { LegalDocument } from "./documents";
import { rebaseSite } from "./rebase";

/** Terms, Privacy or Refund: the same header and footer as the home page around a plain, readable document. */
export async function LegalPage({ slug }: { slug: LegalDocument["slug"] }) {
  const doc = DOCUMENTS[slug];
  const { site } = await getLandingContent();
  const pageSite = rebaseSite(site);

  return (
    <div className="mcc-root" style={{ width: "100%", background: "#fff", color: "#171717" }}>
      <SiteHeader site={pageSite} homeHref="/" />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(32px,6vw,72px) clamp(20px,5vw,40px) 96px" }}>
        <p
          role="note"
          style={{ margin: "0 0 28px", padding: "14px 18px", borderRadius: 14, background: "#FFF7E0", border: "1px solid #F2D98A", color: "#5C4300", fontSize: 15, lineHeight: 1.5 }}
        >
          <strong>Draft, pending legal review.</strong> This page describes how My Course Companion works today. It has not yet been reviewed by a
          lawyer and may change. Items marked TO CONFIRM still need company details or decisions.
        </p>

        <h1 style={{ margin: 0, fontSize: "clamp(32px,5vw,44px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{doc.title}</h1>
        <p style={{ margin: "12px 0 4px", fontSize: 18, lineHeight: 1.55, color: "#404040" }}>{doc.summary}</p>
        <p style={{ margin: "0 0 36px", fontSize: 14, color: "#737373" }}>Last updated {doc.updated}</p>

        <nav aria-label="Legal pages" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
          {LEGAL_LINKS.map((link) => {
            const current = link.href === `/${slug}`;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                style={{
                  padding: "8px 16px", borderRadius: 999, fontSize: 15, fontWeight: 600, textDecoration: "none",
                  background: current ? "#6717DE" : "#F4EFFF", color: current ? "#fff" : "#4F0FB0",
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {doc.sections.map((section) => (
          <section key={section.heading} style={{ marginBottom: 32 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 22, lineHeight: 1.25 }}>{section.heading}</h2>
            {section.paragraphs?.map((p, i) => (
              <p key={i} style={{ margin: "0 0 12px", fontSize: 17, lineHeight: 1.7, color: "#262626" }}>{p}</p>
            ))}
            {section.bullets && (
              <ul style={{ margin: "0 0 12px", paddingLeft: 22, fontSize: 17, lineHeight: 1.7, color: "#262626" }}>
                {section.bullets.map((b, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
      <SiteFooter site={pageSite} />
    </div>
  );
}
