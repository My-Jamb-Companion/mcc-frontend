import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { safeHref } from "@mcc/landing-content";

export const DISPLAY = "var(--mcc-display)";

export function Arrow({ size = 18, width = 2.2 }: { size?: number; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function Check({ size = 13, width = 3 }: { size?: number; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * A link from CMS content. Site paths use Next's router; /go/<app> hand-offs and everything
 * else are ordinary links. An empty or unsafe address (the backend refuses those, but old
 * content may hold one) becomes "#" rather than a dead or dangerous link.
 */
export function A({ href, children, ...rest }: { href: string; children: ReactNode; id?: string; className?: string; style?: CSSProperties; "aria-label"?: string }) {
  const target = safeHref(href);
  const internal = target.startsWith("/") && !target.startsWith("/go/");
  return internal ? (
    <Link href={target} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={target} {...rest}>
      {children}
    </a>
  );
}

type Tone = "primary" | "outline" | "dark" | "white" | "glass";

const BUTTONS: Record<Tone, { className: string; style: CSSProperties }> = {
  primary: { className: "mcc-btn mcc-btn-primary", style: { background: "#6717DE", color: "#fff" } },
  outline: { className: "mcc-btn mcc-btn-outline", style: { background: "#fff", color: "#171717", border: "1.5px solid #D9CCF5" } },
  dark: { className: "mcc-btn mcc-btn-dark", style: { background: "transparent", color: "#171717", border: "1.5px solid #171717" } },
  white: { className: "mcc-btn mcc-btn-white", style: { background: "#fff", color: "#4F0FB0", fontWeight: 700 } },
  glass: { className: "mcc-btn mcc-btn-glass", style: { background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,.7)" } },
};

/** The pill buttons used throughout the page. */
export function Button({ href, tone = "primary", size = "md", arrow = false, shadow = false, children }: {
  href: string; tone?: Tone; size?: "md" | "lg"; arrow?: boolean; shadow?: boolean; children: ReactNode;
}) {
  const base = BUTTONS[tone];
  const lg = size === "lg";
  return (
    <A
      href={href}
      className={base.className}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10, minHeight: lg ? 56 : 52, padding: lg ? "0 26px" : "0 24px",
        borderRadius: 999, fontSize: lg ? 17 : 16, fontWeight: 600, ...base.style,
        ...(shadow ? { boxShadow: "0 10px 24px -10px rgba(103,23,222,.7)" } : null),
      }}
    >
      {children}
      {arrow && <Arrow />}
    </A>
  );
}

/** A full-width section: the container-query box the fluid sizes (cqw) are measured against. */
export function Section({ id, blockId, background, color = "#171717", border, overflow, pad = "clamp(64px,8cqw,112px) clamp(20px,5cqw,56px)", gap, children }: {
  id: string; blockId?: string; background: string; color?: string; border?: boolean; overflow?: boolean; pad?: string; gap?: number | string; children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-block-id={blockId}
      style={{ containerType: "inline-size", background, color, borderTop: border ? "1px solid #EEEAF5" : undefined, overflow: overflow ? "hidden" : undefined }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: pad, display: "flex", flexDirection: "column", gap }}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children, color = "#6717DE" }: { children: ReactNode; color?: string }) {
  return children ? <span style={{ fontSize: 14, fontWeight: 600, color }}>{children}</span> : null;
}

export function H2({ children, size = "clamp(34px,4.6cqw,56px)", lineHeight = 1.04 }: { children: ReactNode; size?: string; lineHeight?: number }) {
  return (
    <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 400, fontSize: size, lineHeight, letterSpacing: "-0.01em", textWrap: "balance" }}>
      {children}
    </h2>
  );
}

export function Lead({ children, color = "#4A4A4A", maxWidth }: { children: ReactNode; color?: string; maxWidth?: number }) {
  return children ? (
    <p style={{ margin: 0, fontSize: "clamp(16px,1.5cqw,18px)", lineHeight: 1.6, color, maxWidth, textWrap: "pretty" }}>{children}</p>
  ) : null;
}

/** The standard heading stack: small heading, big heading, paragraph. */
export function Intro({ eyebrow, headline, body, maxWidth = 640 }: { eyebrow?: string; headline: string; body?: string; maxWidth?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <H2>{headline}</H2>
      {body ? <Lead>{body}</Lead> : null}
    </div>
  );
}

/** The dark phone frame the app mockups sit in. */
export function Phone({ width, children, radius = 44, shadow = "0 30px 60px -24px rgba(60,20,140,.45)", background = "#0A0A0A", pad = 9, style }: {
  width: string; children: ReactNode; radius?: number; shadow?: string; background?: string; pad?: number; style?: CSSProperties;
}) {
  return <div style={{ position: "relative", width, borderRadius: radius, background, padding: pad, boxShadow: shadow, ...style }}>{children}</div>;
}

export const Pill = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: ".04em", ...style }}>{children}</span>
);

export function BrandMark({ letter, logoUrl, size = 40, radius = 12 }: { letter: string; logoUrl?: string; size?: number; radius?: number }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flex: "none" }} />;
  }
  return (
    <span style={{ width: size, height: size, flex: "none", borderRadius: radius, background: "#6B26FF", display: "grid", placeItems: "center", color: "#fff", fontFamily: DISPLAY, fontSize: 22, lineHeight: 1 }}>
      {letter}
    </span>
  );
}
