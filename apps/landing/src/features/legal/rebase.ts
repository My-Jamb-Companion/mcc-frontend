import type { FieldData } from "@mcc/landing-content";

type Link = Record<string, unknown>;

const rebaseHref = (link: Link): Link => {
  const href = typeof link.href === "string" ? link.href : "";
  return href.startsWith("#") ? { ...link, href: `/${href}` } : link;
};

/**
 * The site settings as a page other than the home page needs them. The header and footer links
 * are written for the home page ("#exams" scrolls to a section), so on /terms they would go
 * nowhere; here they point back to the home page's sections ("/#exams").
 */
export function rebaseSite(site: FieldData): FieldData {
  const links = (value: unknown): Link[] => (Array.isArray(value) ? (value as Link[]) : []);
  return {
    ...site,
    nav_links: links(site.nav_links).map(rebaseHref),
    parent_href: typeof site.parent_href === "string" && site.parent_href.startsWith("#") ? `/${site.parent_href}` : site.parent_href,
    footer_columns: links(site.footer_columns).map((column) => ({
      ...column,
      links: links(column.links).map(rebaseHref),
    })),
  };
}
