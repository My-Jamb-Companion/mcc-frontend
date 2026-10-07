"use client";

import { useState } from "react";
import { list, str } from "@mcc/landing-content";
import type { FieldData } from "@mcc/landing-content";
import { A, BrandMark } from "./ui";

/**
 * The sticky header. The wide bar (menu + log in) and the compact bar (menu button) are both
 * rendered and swapped by a container query in landing.css, so the page never flashes the wrong one.
 */
export function SiteHeader({ site }: { site: FieldData }) {
  const [open, setOpen] = useState(false);
  const links = list(site, "nav_links");
  const letter = str(site, "logo_letter") || str(site, "brand_name").charAt(0).toLowerCase() || "m";
  const brand = (name: string, weight = 17) => (
    <span style={{ fontWeight: 700, fontSize: weight, letterSpacing: "-0.01em" }}>{name}</span>
  );

  return (
    <header className="mcc-header" style={{ position: "sticky", top: 0, zIndex: 30, background: "#fff", borderBottom: "1px solid #EEEAF5", color: "#171717" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4cqw,56px)", height: 72, display: "flex", alignItems: "center", gap: "clamp(12px,2cqw,24px)" }}>
        <A href="#top" aria-label={`${str(site, "brand_name")}, home`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#171717", flex: "none" }}>
          <BrandMark letter={letter} logoUrl={str(site, "logo_url")} />
          <span className="mcc-header-wide" style={{ display: undefined }}>{brand(str(site, "brand_name"))}</span>
          <span className="mcc-header-compact">{brand(str(site, "brand_short") || str(site, "brand_name"), 18)}</span>
        </A>

        <nav className="mcc-header-wide" aria-label="Main" style={{ gap: 2, flex: 1, justifyContent: "center" }}>
          {links.map((l, i) => (
            <A key={i} href={str(l, "href")} className="mcc-navlink" style={{ padding: "10px 12px", borderRadius: 10, fontSize: 15, fontWeight: 500, color: "#262626", textDecoration: "none" }}>
              {str(l, "label")}
            </A>
          ))}
        </nav>
        <A href={str(site, "login_href")} className="mcc-header-wide mcc-navlink" style={{ alignItems: "center", minHeight: 48, padding: "0 16px", borderRadius: 999, fontSize: 15, fontWeight: 600, color: "#171717", textDecoration: "none" }}>
          {str(site, "login_label")}
        </A>
        <span className="mcc-header-compact" style={{ flex: 1 }} />

        <A href={str(site, "cta_href")} className="mcc-btn mcc-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 18px", borderRadius: 999, background: "#6717DE", color: "#fff", fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", flex: "none" }}>
          <span className="mcc-header-wide" style={{ display: undefined }}>{str(site, "cta_label")}</span>
          <span className="mcc-header-compact">{str(site, "cta_label_short") || str(site, "cta_label")}</span>
        </A>

        <button
          type="button"
          className="mcc-header-compact"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          style={{ width: 44, height: 44, flex: "none", borderRadius: 12, border: "1.5px solid #E7E2F3", background: "#fff", color: "#171717", placeItems: "center", cursor: "pointer", padding: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>) : (<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>)}
          </svg>
        </button>
      </div>

      {open && (
        <div className="mcc-header-compact" style={{ borderTop: "1px solid #EEEAF5", padding: "8px 16px 20px", flexDirection: "column", background: "#fff" }}>
          {links.map((l, i) => (
            <A key={i} href={str(l, "href")} style={{ display: "flex", alignItems: "center", minHeight: 52, padding: "0 8px", borderBottom: "1px solid #F2EEF8", fontSize: 16, fontWeight: 500, color: "#171717", textDecoration: "none" }}>
              {str(l, "label")}
            </A>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <A href={str(site, "login_href")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 999, border: "1.5px solid #171717", color: "#171717", fontWeight: 600, textDecoration: "none" }}>{str(site, "login_label")}</A>
            {str(site, "parent_label") && (
              <A href={str(site, "parent_href")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 999, background: "#F4EFFF", color: "#4F0FB0", fontWeight: 600, textDecoration: "none" }}>{str(site, "parent_label")}</A>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

