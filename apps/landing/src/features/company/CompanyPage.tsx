import "../home/landing.css";
import { SiteFooter } from "../home/SiteFooter";
import { SiteHeader } from "../home/SiteHeader";
import { getLandingContent } from "../home/content";
import { rebaseSite } from "../legal/rebase";

/** The home page's header and footer around a plain, readable page (About, Contact). */
export async function CompanyPage({ title, summary, children }: { title: string; summary: string; children: React.ReactNode }) {
  const { site } = await getLandingContent();
  const pageSite = rebaseSite(site);

  return (
    <div className="mcc-root" style={{ width: "100%", background: "#fff", color: "#171717" }}>
      <SiteHeader site={pageSite} homeHref="/" />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(32px,6vw,72px) clamp(20px,5vw,40px) 96px" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(32px,5vw,44px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{title}</h1>
        <p style={{ margin: "12px 0 36px", fontSize: 18, lineHeight: 1.55, color: "#404040" }}>{summary}</p>
        {children}
      </main>
      <SiteFooter site={pageSite} />
    </div>
  );
}

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ margin: "0 0 10px", fontSize: 22, lineHeight: 1.25 }}>{children}</h2>
);

export const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ margin: "0 0 12px", fontSize: 17, lineHeight: 1.7, color: "#262626" }}>{children}</p>
);
