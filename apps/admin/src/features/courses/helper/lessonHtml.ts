/**
 * Lesson HTML, as the admin's editor (Quill) writes it, made ready to show students.
 *
 * Kept identical in apps/learner (features/learnings/helper/lessonHtml.ts) so "View as a
 * student" renders exactly what students get. String-only (no DOM), so it behaves the
 * same on the server and in the browser.
 *
 * Quill 2 writes every list as <ol><li data-list="bullet|ordered|checked|unchecked"
 * class="ql-indent-N">, decorated with an empty <span class="ql-ui">, and relies on its
 * own stylesheet to turn those into bullets and numbers. Without that stylesheet a
 * bulleted list shows no bullets at all. This rebuilds them as real nested <ul>/<ol>.
 */

const QL_UI = /<span\b[^>]*class="[^"]*\bql-ui\b[^"]*"[^>]*>\s*<\/span>/gi;
const LIST_BLOCK = /<(ol|ul)\b[^>]*>([\s\S]*?)<\/\1>/gi;
const LIST_ITEM = /<li\b([^>]*)>([\s\S]*?)<\/li>/gi;
const MAX_DEPTH = 8;

type Kind = "ol" | "ul";

interface Item {
  kind: Kind;
  indent: number;
  state: "checked" | "unchecked" | null;
  html: string;
}

function parseItems(block: string): Item[] | null {
  const items: Item[] = [];
  for (const m of block.matchAll(LIST_ITEM)) {
    const attrs = m[1];
    const type = attrs.match(/data-list="([^"]*)"/i)?.[1];
    // Not a Quill 2 list (no data-list): it is already real HTML, leave it alone.
    if (!type) return null;
    const indent = Number(attrs.match(/\bql-indent-(\d+)\b/)?.[1] ?? 0);
    items.push({
      kind: type === "ordered" ? "ol" : "ul",
      indent: Math.min(indent, MAX_DEPTH - 1),
      state: type === "checked" || type === "unchecked" ? type : null,
      html: m[2],
    });
  }
  return items.length ? items : null;
}

/** A flat run of Quill list items as properly nested <ul>/<ol>. */
function buildLists(items: Item[]): string {
  let out = "";
  const open: {kind: Kind; liOpen: boolean}[] = [];

  for (const item of items) {
    // Quill's indent can't skip a level; be safe if the data does.
    const depth = Math.min(item.indent + 1, open.length + 1);

    while (open.length > depth) {
      const top = open.pop()!;
      out += `${top.liOpen ? "</li>" : ""}</${top.kind}>`;
    }
    if (open.length === depth) {
      const top = open[depth - 1];
      if (top.kind !== item.kind) {
        // Same level, different kind of list: end this list and start the other.
        out += `${top.liOpen ? "</li>" : ""}</${top.kind}>`;
        open.pop();
      } else if (top.liOpen) {
        out += "</li>";
        top.liOpen = false;
      }
    }
    while (open.length < depth) {
      out += `<${item.kind}>`;
      open.push({kind: item.kind, liOpen: false});
    }

    const cls = item.state ? ` class="lesson-task lesson-task-${item.state}"` : "";
    out += `<li${cls}>${item.html}`;
    open[open.length - 1].liOpen = true;
  }

  while (open.length) {
    const top = open.pop()!;
    out += `${top.liOpen ? "</li>" : ""}</${top.kind}>`;
  }
  return out;
}

/**
 * Quill's HTML export writes EVERY space as &nbsp;. A non-breaking space can never wrap,
 * so text saved that way only breaks at hyphens (or by force at the edge), which reads as
 * muddled lines. Turn them back into ordinary spaces, except inside code blocks where
 * spacing is meant literally.
 */
export function relaxSpaces(html: string): string {
  if (!html) return "";
  return html
    .split(/(<pre\b[\s\S]*?<\/pre>)/i)
    .map((part, i) => (i % 2 ? part : part.replace(/&nbsp;|\u00a0/g, " ")))
    .join("");
}

/** Blank paragraphs (an author pressing Enter twice): paragraph spacing already separates paragraphs. */
const EMPTY_PARAGRAPH = /<p\b[^>]*>\s*(?:<br\s*\/?>\s*)?<\/p>/gi;

/** Quill-written lesson HTML, rebuilt so it shows correctly without Quill's own stylesheet. */
export function normalizeLessonHtml(html: string): string {
  if (!html) return "";
  const cleaned = relaxSpaces(html).replace(QL_UI, "").replace(EMPTY_PARAGRAPH, "");
  return cleaned.replace(LIST_BLOCK, (whole, _tag: string, inner: string) => {
    const items = parseItems(inner);
    return items ? buildLists(items) : whole;
  });
}
