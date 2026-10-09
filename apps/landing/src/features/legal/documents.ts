// The built-in text of the three legal pages is in @mcc/landing-content; what the site shows is whatever an
// admin has published, falling back to that text. This file adds the footer's link rules.
export type { LegalDocument, LegalSection } from "@mcc/landing-content";
export { DOCUMENTS, LEGAL_UPDATED, TERMS, PRIVACY, REFUND } from "@mcc/landing-content";


/** The footer's legal links: where each goes, and the words that identify them in a column whose links have no address yet. */
export const LEGAL_LINKS: { label: string; href: string; match: RegExp }[] = [
  { label: "Terms", href: "/terms", match: /^terms/i },
  { label: "Privacy", href: "/privacy", match: /^privacy/i },
  { label: "Refund policy", href: "/refund", match: /^refund/i },
];

/** Company pages a blank footer link goes to, so "About" and "Contact" work without republishing the site settings. */
const COMPANY_LINKS: { href: string; match: RegExp }[] = [
  { href: "/about", match: /^about/i },
  { href: "/contact", match: /^contact/i },
];

/** The address for a footer link left blank, if its label names a legal or company page. */
export function legalFallbackHref(label: string): string {
  const name = label.trim();
  return [...LEGAL_LINKS, ...COMPANY_LINKS].find((l) => l.match.test(name))?.href ?? "";
}
