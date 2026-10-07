/**
 * Turns what an admin pastes into a lesson (from Google Docs, Word, a web page, or a
 * PDF) into clean HTML for the lesson editor, so formatting carries through to students:
 *
 *  - Google Docs / Word / web HTML: keep bold, italic, underline, strike, super/subscript,
 *    colour, links, headings, lists (including Word's "fake" lists), tables, alignment and
 *    web images; drop the mess around them (inline fonts and sizes, wrapper tags, empty
 *    spacer paragraphs, comments, Word markup). Docs wraps a whole paste in a <b> that
 *    isn't bold, which would otherwise make everything bold.
 *  - PDF and plain text: copied PDF text ends every visual line with a line break. Those
 *    lines are joined back into paragraphs, and bullet/number lines become lists.
 *
 * Headings: Heading 1 and 2 become the lesson's H2 (the editor's one heading level, which
 * is also what starts a new page for the student); Heading 3-6 become bold paragraphs, so
 * a long document does not shatter into tiny pages.
 */

const REMOVE = "style,script,meta,link,title,xml,noscript,head,template,o\\:p,iframe,object,embed,form,input,button,select,textarea,svg,canvas,video,audio";
const BLOCKS = new Set(["P", "DIV", "UL", "OL", "LI", "TABLE", "TR", "TD", "TH", "TBODY", "THEAD", "BLOCKQUOTE", "PRE", "H1", "H2", "H3", "H4", "H5", "H6", "HR"]);
const INLINE_FORMAT_TAGS = new Set(["SPAN", "FONT", "B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DEL", "SUP", "SUB", "MARK", "BIG", "SMALL"]);
const SENTENCE_END = /[.!?:;]["'”’)\]]*$/;
const BULLET = /^\s*[•·▪▫●○◦■□◆◇➢➤►▶✓✔\u2022\u25CF\-–—*]\s+(.*)$/;
const NUMBERED = /^\s*(?:\d{1,3}|[a-zA-Z])[.)]\s+(.*)$/;

// ---------- joining hard-wrapped lines ----------

interface Line {
  html: string;
  text: string;
}

const textLength = (l: Line) => l.text.trim().length;

/** Two hard-wrapped lines as one: "pin-" + "point" keeps its hyphen ("pin-point"), which is
 * right for real compounds and a small visible glitch, never a wrong word, for typeset hyphenation. */
function joinHtml(prev: string, next: string): string {
  const p = prev.replace(/\s+$/, "");
  const n = next.replace(/^\s+/, "");
  return /-$/.test(p) && /^[a-z]/.test(n.replace(/^<[^>]+>/g, "")) ? p + n : `${p} ${n}`;
}

/**
 * Merges lines that were broken only by the width of a page back into paragraphs. A line
 * ends a paragraph when it finishes a sentence AND is clearly shorter than the longest line
 * (a paragraph's last line); blank lines always do. Text whose lines are all short (a list
 * of items, verse) is left one line per paragraph.
 */
export function mergeWrappedLines(lines: Line[]): string[] {
  const filled = lines.filter((l) => textLength(l) > 0);
  if (filled.length === 0) return [];
  const longest = Math.max(...filled.map(textLength));
  if (longest < 45) return filled.map((l) => l.html);

  const out: string[] = [];
  let current: Line | null = null;
  let prevLength = 0;
  for (const line of lines) {
    if (textLength(line) === 0) {
      if (current) out.push(current.html);
      current = null;
      continue;
    }
    if (current) {
      const endsParagraph = SENTENCE_END.test(current.text.trim()) && prevLength < longest * 0.7;
      if (endsParagraph) {
        out.push(current.html);
        current = {...line};
      } else {
        current = {html: joinHtml(current.html, line.html), text: `${current.text} ${line.text}`};
      }
    } else {
      current = {...line};
    }
    prevLength = textLength(line);
  }
  if (current) out.push(current.html);
  return out;
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plain text (a copied PDF, a text file) as paragraphs and lists. */
export function plainTextToHtml(text: string): string {
  const raw = text.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").replace(/\f/g, "\n\n").split("\n").map((l) => l.replace(/\s+$/, ""));

  // Split into runs of list items and runs of ordinary lines.
  type Run = {kind: "text"; lines: Line[]} | {kind: "ul" | "ol"; items: Line[][]};
  const runs: Run[] = [];
  const last = () => runs[runs.length - 1];

  for (const line of raw) {
    const bullet = line.match(BULLET);
    const numbered = !bullet ? line.match(NUMBERED) : null;
    const marker = bullet ? ("ul" as const) : numbered ? ("ol" as const) : null;

    if (marker) {
      const item = {html: escapeHtml((bullet ?? numbered)![1].trim()), text: (bullet ?? numbered)![1]};
      const tail = last();
      if (tail && tail.kind === marker) tail.items.push([item]);
      else runs.push({kind: marker, items: [[item]]});
      continue;
    }

    const plain = {html: escapeHtml(line.trim()), text: line};
    const tail = last();
    // An indented line right under a list item continues that item.
    if (tail && tail.kind !== "text" && line.trim() && /^\s+/.test(line)) {
      tail.items[tail.items.length - 1].push(plain);
    } else if (tail && tail.kind === "text") tail.lines.push(plain);
    else runs.push({kind: "text", lines: [plain]});
  }

  return runs
    .map((run) => {
      if (run.kind === "text") return mergeWrappedLines(run.lines).map((h) => `<p>${h}</p>`).join("");
      const items = run.items.map((item) => `<li>${mergeWrappedLines(item).join(" ")}</li>`).join("");
      return `<${run.kind}>${items}</${run.kind}>`;
    })
    .join("");
}

// ---------- HTML from Docs / Word / the web ----------

function isNearBlackOrWhite(color: string): boolean {
  const c = color.trim().toLowerCase();
  if (!c || c === "inherit" || c === "initial" || c === "transparent" || c === "windowtext" || c === "black" || c === "white") return true;
  let rgb: number[] | null = null;
  const hex = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split("").map((x) => x + x).join("") : hex[1];
    rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const fn = c.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (fn) rgb = [Number(fn[1]), Number(fn[2]), Number(fn[3])];
  if (!rgb) return false;
  return rgb.every((v) => v < 70) || rgb.every((v) => v > 235);
}

interface Formats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  sup: boolean;
  sub: boolean;
  color: string | null;
}

function formatsOf(el: HTMLElement): Formats {
  const tag = el.tagName;
  const s = el.style;
  const weight = s.fontWeight;
  const numeric = Number(weight);
  const styledBold = weight === "bold" || weight === "bolder" || (Number.isFinite(numeric) && numeric >= 600);
  const styledNotBold = weight === "normal" || weight === "lighter" || (weight !== "" && Number.isFinite(numeric) && numeric < 600);
  const tagBold = tag === "B" || tag === "STRONG";
  const decoration = `${s.textDecoration} ${s.textDecorationLine}`.toLowerCase();
  const align = s.verticalAlign;
  const color = s.color && !isNearBlackOrWhite(s.color) ? s.color : null;
  return {
    bold: styledBold || (tagBold && !styledNotBold),
    italic: s.fontStyle === "italic" || tag === "I" || tag === "EM",
    underline: decoration.includes("underline") || tag === "U",
    strike: decoration.includes("line-through") || tag === "S" || tag === "STRIKE" || tag === "DEL",
    sup: align === "super" || tag === "SUP",
    sub: align === "sub" || tag === "SUB",
    color,
  };
}

const hasBlockChild = (el: Element) => Array.from(el.querySelectorAll("*")).some((c) => BLOCKS.has(c.tagName));

function rebuildInline(el: HTMLElement, doc: Document) {
  const f = formatsOf(el);
  // A link looks like a link on its own; Docs' blue and underline on its text are not carried over.
  if (el.closest("a")) {
    f.color = null;
    f.underline = false;
  }
  const children = Array.from(el.childNodes);
  if (hasBlockChild(el)) {
    el.replaceWith(...children);
    return;
  }
  const chain: string[] = [];
  if (f.bold) chain.push("strong");
  if (f.italic) chain.push("em");
  if (f.underline) chain.push("u");
  if (f.strike) chain.push("s");
  if (f.sup) chain.push("sup");
  else if (f.sub) chain.push("sub");
  if (f.color) chain.push("span");

  if (chain.length === 0) {
    el.replaceWith(...children);
    return;
  }
  const wrappers = chain.map((t) => {
    const w = doc.createElement(t);
    if (t === "span") w.setAttribute("style", `color: ${f.color}`);
    return w;
  });
  wrappers.forEach((w, i) => i > 0 && wrappers[i - 1].appendChild(w));
  wrappers[wrappers.length - 1].append(...children);
  el.replaceWith(wrappers[0]);
}

/** Google wraps outbound links as google.com/url?q=<real link>; Word and Docs add file:/javascript: links. */
function realHref(href: string): string | null {
  try {
    const url = new URL(href, "https://invalid.invalid");
    if (url.hostname.endsWith("google.com") && url.pathname === "/url" && url.searchParams.get("q")) return realHref(url.searchParams.get("q")!);
    if (/^https?:$/.test(url.protocol) && url.hostname !== "invalid.invalid") return url.toString();
    if (url.protocol === "mailto:") return href;
  } catch {
    /* not a link */
  }
  return null;
}

/** Word's list paragraphs (class MsoListParagraph, style mso-list:...) as real nested lists. */
function convertWordLists(body: HTMLElement, doc: Document) {
  const isListPara = (el: Element) =>
    el.tagName === "P" && (/MsoList/i.test(el.getAttribute("class") ?? "") || /mso-list\s*:\s*(?!none)[a-z0-9]/i.test(el.getAttribute("style") ?? ""));

  const parents = new Set(Array.from(body.querySelectorAll("p")).filter(isListPara).map((p) => p.parentElement!));
  for (const parent of parents) {
    let node: Element | null = parent.firstElementChild;
    while (node) {
      if (!isListPara(node)) {
        node = node.nextElementSibling;
        continue;
      }
      const stack: {list: HTMLElement; li: HTMLElement | null}[] = [];
      let first: Element | null = null;
      while (node && isListPara(node)) {
        const para = node as HTMLElement;
        const next: Element | null = para.nextElementSibling;
        const level = Number(para.getAttribute("style")?.match(/level(\d+)/i)?.[1] ?? 1);
        const marker = Array.from(para.querySelectorAll("span")).find((s) => /mso-list\s*:\s*ignore/i.test(s.getAttribute("style") ?? ""));
        const markerText = marker?.textContent ?? "";
        const kind = /^\s*(\d+|[a-zA-Z]{1,3})[.)]/.test(markerText) ? "ol" : "ul";
        marker?.remove();

        const depth = Math.max(1, Math.min(level, stack.length + 1));
        while (stack.length > depth) stack.pop();
        if (stack.length === depth && stack[depth - 1].list.tagName.toLowerCase() !== kind) stack.pop();
        while (stack.length < depth) {
          const list = doc.createElement(kind);
          const parentLi = stack.length ? stack[stack.length - 1].li : null;
          if (parentLi) parentLi.appendChild(list);
          else if (!first) {
            first = para;
            para.before(list);
          } else stack[0].list.parentElement?.appendChild(list);
          stack.push({list, li: null});
        }
        const li = doc.createElement("li");
        li.append(...Array.from(para.childNodes));
        stack[depth - 1].list.appendChild(li);
        stack[depth - 1].li = li;
        para.remove();
        node = next;
      }
    }
  }
}

function setAlignment(el: HTMLElement) {
  const a = el.style.textAlign;
  if (a === "center" || a === "right" || a === "justify") el.setAttribute("data-align", a);
}

/** Runs of plain paragraphs whose lines were only broken by a page's width, joined back up. */
function unwrapParagraphRuns(body: HTMLElement, doc: Document) {
  const isPlainPara = (el: Element | null): el is HTMLElement => !!el && el.tagName === "P" && !el.hasAttribute("data-align") && !el.querySelector("img,table");
  let node = body.firstElementChild;
  while (node) {
    if (!isPlainPara(node)) {
      node = node.nextElementSibling;
      continue;
    }
    const run: HTMLElement[] = [];
    let cursor: Element | null = node;
    while (isPlainPara(cursor)) {
      run.push(cursor);
      cursor = cursor.nextElementSibling;
    }
    const lengths = run.map((p) => (p.textContent ?? "").trim().length);
    const longest = Math.max(...lengths);
    const wrapped = lengths.slice(0, -1).filter((n) => n >= longest * 0.8 && !SENTENCE_END.test((run[lengths.indexOf(n)].textContent ?? "").trim())).length;
    // Looks like a page's worth of hard-wrapped lines, not real paragraphs.
    if (run.length >= 3 && longest >= 45 && wrapped >= (run.length - 1) * 0.5) {
      const merged = mergeWrappedLines(run.map((p) => ({html: p.innerHTML, text: p.textContent ?? ""})));
      const fragment = doc.createDocumentFragment();
      merged.forEach((html) => {
        const p = doc.createElement("p");
        p.innerHTML = html;
        fragment.appendChild(p);
      });
      run[0].before(fragment);
      run.forEach((p) => p.remove());
    }
    node = cursor;
  }
}

/** Pasted HTML as clean lesson HTML. Needs a DOM (the browser). */
export function cleanPastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  body.querySelectorAll(REMOVE).forEach((e) => e.remove());
  const comments = doc.createTreeWalker(body, NodeFilter.SHOW_COMMENT);
  const found: Node[] = [];
  while (comments.nextNode()) found.push(comments.currentNode);
  found.forEach((c) => c.parentNode?.removeChild(c));

  convertWordLists(body, doc);

  // Children before parents, so a replaced element's children have already been dealt with.
  const all = Array.from(body.querySelectorAll<HTMLElement>("*")).reverse();
  for (const el of all) {
    if (!el.isConnected) continue;
    const tag = el.tagName;

    if (INLINE_FORMAT_TAGS.has(tag)) {
      rebuildInline(el, doc);
    } else if (tag === "H1" || tag === "H2") {
      setAlignment(el);
      const h2 = doc.createElement("h2");
      if (el.hasAttribute("data-align")) h2.setAttribute("data-align", el.getAttribute("data-align")!);
      h2.append(...Array.from(el.childNodes));
      el.replaceWith(h2);
    } else if (/^H[3-6]$/.test(tag)) {
      const p = doc.createElement("p");
      const strong = doc.createElement("strong");
      strong.append(...Array.from(el.childNodes));
      p.appendChild(strong);
      el.replaceWith(p);
    } else if (tag === "DIV") {
      if (hasBlockChild(el)) el.replaceWith(...Array.from(el.childNodes));
      else {
        setAlignment(el);
        const p = doc.createElement("p");
        if (el.hasAttribute("data-align")) p.setAttribute("data-align", el.getAttribute("data-align")!);
        p.append(...Array.from(el.childNodes));
        el.replaceWith(p);
      }
    } else if (tag === "P") {
      setAlignment(el);
    } else if (tag === "TH") {
      const td = doc.createElement("td");
      const strong = doc.createElement("strong");
      strong.append(...Array.from(el.childNodes));
      td.appendChild(strong);
      ["colspan", "rowspan"].forEach((a) => el.hasAttribute(a) && td.setAttribute(a, el.getAttribute(a)!));
      el.replaceWith(td);
    } else if (tag === "THEAD" || tag === "TBODY" || tag === "TFOOT" || tag === "COLGROUP" || tag === "COL" || tag === "CENTER") {
      if (tag === "COLGROUP" || tag === "COL") el.remove();
      else el.replaceWith(...Array.from(el.childNodes));
    } else if (tag === "A") {
      const href = realHref(el.getAttribute("href") ?? "");
      if (href) el.setAttribute("href", href);
      else el.replaceWith(...Array.from(el.childNodes));
    } else if (tag === "IMG") {
      if (!/^https?:\/\//i.test(el.getAttribute("src") ?? "")) el.remove();
    }
  }

  // Spacer <br>s between blocks (Docs puts one after each paragraph) are not content.
  Array.from(body.children).filter((c) => c.tagName === "BR").forEach((br) => br.remove());

  // A paragraph inside a list item or table cell is just that item's text.
  body.querySelectorAll("li > p").forEach((p) => p.replaceWith(...Array.from(p.childNodes)));
  body.querySelectorAll("td").forEach((cell) => {
    const paras = Array.from(cell.children).filter((c) => c.tagName === "P");
    paras.forEach((p, i) => {
      if (i > 0) p.before(doc.createElement("br"));
      p.replaceWith(...Array.from(p.childNodes));
    });
  });

  // Only the attributes that mean something are kept.
  body.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const keep = new Set<string>();
    const tag = el.tagName;
    if (tag === "A") keep.add("href");
    if (tag === "IMG") keep.add("src").add("alt");
    if (tag === "TD") keep.add("colspan").add("rowspan");
    if (tag === "SPAN") keep.add("style");
    // Alignment was noted as data-align earlier; read it before attributes are cleared.
    const align = el.getAttribute("data-align");
    for (const attr of Array.from(el.attributes)) if (!keep.has(attr.name)) el.removeAttribute(attr.name);
    if (align && (tag === "P" || tag === "H2")) el.setAttribute("class", `ql-align-${align}`);
  });

  // Whitespace: source line breaks and runs of spaces are not content.
  const texts = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (texts.nextNode()) nodes.push(texts.currentNode as Text);
  nodes.forEach((t) => {
    if (t.parentElement?.closest("pre")) return;
    t.data = t.data.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ");
    // Spaces between blocks (between list items, table rows, paragraphs) are layout, not content.
    if (!t.data.trim() && t.parentElement && /^(BODY|UL|OL|TABLE|TBODY|TR)$/.test(t.parentElement.tagName)) t.remove();
  });

  // Empty spacer paragraphs and trailing <br>s: spacing comes from the lesson's own styles.
  body.querySelectorAll("p").forEach((p) => {
    p.querySelectorAll("br:last-child").forEach((br) => br.remove());
    if (!(p.textContent ?? "").replace(/[\s\u00a0]+/g, "") && !p.querySelector("img")) p.remove();
  });
  body.querySelectorAll("span:empty, strong:empty, em:empty, u:empty, s:empty").forEach((e) => e.remove());

  unwrapParagraphRuns(body, doc);
  return body.innerHTML.trim();
}

/**
 * What to paste for a clipboard, or null to leave it to the editor's own handling
 * (a single line, or content copied from the editor itself).
 */
export function planPaste(html: string, text: string): string | null {
  if (html && !/\bql-(editor|align|indent|size|font|syntax|ui|direction)\b/.test(html)) {
    const cleaned = cleanPastedHtml(html);
    if (cleaned) return cleaned;
  }
  if (!html && /\n/.test(text.trim())) return plainTextToHtml(text) || null;
  return null;
}
