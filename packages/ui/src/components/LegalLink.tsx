import type {ReactNode} from "react";

export type LegalDoc = "terms" | "privacy" | "refund";

const PATHS: Record<LegalDoc, string> = {terms: "/terms", privacy: "/privacy", refund: "/refund"};

/** The landing site hosts the legal pages. Each app sets NEXT_PUBLIC_LANDING_URL; the default is the local landing dev server. */
const landingUrl = (): string => (process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3004").replace(/\/+$/, "");

/** The address of a legal page on the landing site. */
export const legalUrl = (doc: LegalDoc): string => `${landingUrl()}${PATHS[doc]}`;

/**
 * A link to the Terms, Privacy Policy or Refund Policy. They open in a new tab so a student halfway
 * through signing up doesn't lose their place.
 */
export function LegalLink({doc, children, className = "underline hover:text-primary"}: {doc: LegalDoc; children: ReactNode; className?: string}) {
  return (
    <a href={legalUrl(doc)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
