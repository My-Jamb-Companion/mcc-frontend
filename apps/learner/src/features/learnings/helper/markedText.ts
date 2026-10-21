export interface TextPart {
  text: string;
  underline: boolean;
}

/**
 * Text with __double underscores__ around what is underlined, split into parts. Underlining does not survive a
 * spreadsheet, so a question's author marks it this way ("He spoke with __his heart in his mouth__"), the way
 * past papers show "the underlined portion". An unmatched pair of underscores stays as typed.
 */
export function splitUnderlined(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const pattern = /__(.+?)__/gs;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({text: text.slice(last, start), underline: false});
    parts.push({text: match[1], underline: true});
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({text: text.slice(last), underline: false});
  return parts.length ? parts : [{text, underline: false}];
}

/** Whether the text has anything marked as underlined. */
export const hasUnderline = (text: string): boolean => splitUnderlined(text).some((p) => p.underline);
