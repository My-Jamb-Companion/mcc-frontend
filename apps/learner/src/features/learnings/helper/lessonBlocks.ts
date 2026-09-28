export interface ContentBlock {
  heading: string | null;
  html: string;
}

/**
 * Splits admin-authored lesson HTML into one block per top-level <h2> --
 * plain string manipulation (no DOMParser) so this works identically on
 * the server and the client, with no hydration mismatch to guard against.
 * The H2 toolbar button in apps/admin's LessonHtmlEditor is what makes
 * this split meaningful -- admins mark a new block by starting a heading.
 */
export function splitIntoBlocks(html: string): ContentBlock[] {
  if (!html) return [];
  const parts = html.split(/(<h2[^>]*>[\s\S]*?<\/h2>)/gi).filter((p) => p.trim());
  const blocks: ContentBlock[] = [];
  let current: ContentBlock | null = null;

  for (const part of parts) {
    const headingMatch = part.match(/^<h2[^>]*>([\s\S]*?)<\/h2>$/i);
    if (headingMatch) {
      if (current) blocks.push(current);
      current = {heading: headingMatch[1].replace(/<[^>]+>/g, "").trim(), html: ""};
    } else {
      if (!current) current = {heading: null, html: ""};
      current.html += part;
    }
  }
  if (current) blocks.push(current);
  return blocks;
}
