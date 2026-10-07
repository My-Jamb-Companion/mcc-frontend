// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {cleanPastedHtml, mergeWrappedLines, planPaste, plainTextToHtml} from "./lessonPaste";

const LONG = "The quick brown fox jumps over the lazy dog while the sun sets slowly behind the hills and";

describe("plainTextToHtml (copied from a PDF or text file)", () => {
  it("joins lines that were only broken by the page width, into one paragraph", () => {
    const text = `${LONG}\nthe evening air grows cool and quiet across the whole valley of fields and the\nlast birds settle into the trees for the night.`;
    expect(plainTextToHtml(text)).toBe(`<p>${LONG} the evening air grows cool and quiet across the whole valley of fields and the last birds settle into the trees for the night.</p>`);
  });

  it("starts a new paragraph after a blank line, or after a short line that ends a sentence", () => {
    const text = `${LONG} again and again until night.\nShort end of first paragraph.\n${LONG} second paragraph begins here.`;
    const html = plainTextToHtml(text);
    expect(html.match(/<p>/g)).toHaveLength(2);
    expect(plainTextToHtml(`${LONG}.\n\n${LONG}.`).match(/<p>/g)).toHaveLength(2);
  });

  it("keeps the hyphen of a word split across lines, never merging two words", () => {
    const text = `${LONG} and every pin-\npoint on the map was marked in red ink by the careful and patient surveyor.`;
    expect(plainTextToHtml(text)).toContain("pin-point on the map");
  });

  it("turns bullet and numbered lines into lists", () => {
    expect(plainTextToHtml("• first\n• second\n• third")).toBe("<ul><li>first</li><li>second</li><li>third</li></ul>");
    expect(plainTextToHtml("1. one\n2. two")).toBe("<ol><li>one</li><li>two</li></ol>");
    expect(plainTextToHtml("- a dash item\n- another")).toBe("<ul><li>a dash item</li><li>another</li></ul>");
  });

  it("joins a wrapped list item's continuation line", () => {
    expect(plainTextToHtml("• the first point which is long\n   and continues here\n• second")).toBe("<ul><li>the first point which is long and continues here</li><li>second</li></ul>");
  });

  it("leaves short lines one per paragraph, and escapes HTML", () => {
    expect(plainTextToHtml("Roses are red\nViolets are blue")).toBe("<p>Roses are red</p><p>Violets are blue</p>");
    expect(plainTextToHtml("a < b & c > d\nsecond")).toBe("<p>a &lt; b &amp; c &gt; d</p><p>second</p>");
  });
});

describe("mergeWrappedLines", () => {
  it("returns nothing for blank input", () => {
    expect(mergeWrappedLines([{html: "", text: " "}])).toEqual([]);
  });
});

describe("cleanPastedHtml: Google Docs", () => {
  const docs = (inner: string) => `<meta charset='utf-8'><b style="font-weight:normal;" id="docs-internal-guid-1234">${inner}</b>`;

  it("does not turn the whole paste bold because of Docs' wrapper", () => {
    const out = cleanPastedHtml(docs(`<p dir="ltr" style="line-height:1.38"><span style="font-size:11pt;font-family:Arial;color:#000000;font-weight:400;">Plain text</span></p>`));
    expect(out).toBe("<p>Plain text</p>");
  });

  it("keeps bold, italic, underline and strike written as span styles", () => {
    const out = cleanPastedHtml(docs(`<p><span style="font-weight:700">B</span><span style="font-style:italic">I</span><span style="text-decoration:underline">U</span><span style="text-decoration:line-through">S</span></p>`));
    expect(out).toBe("<p><strong>B</strong><em>I</em><u>U</u><s>S</s></p>");
  });

  it("combines formats and keeps super/subscript", () => {
    const out = cleanPastedHtml(docs(`<p><span style="font-weight:700;font-style:italic">both</span> H<span style="vertical-align:sub">2</span>O x<span style="vertical-align:super">2</span></p>`));
    expect(out).toBe("<p><strong><em>both</em></strong> H<sub>2</sub>O x<sup>2</sup></p>");
  });

  it("keeps a real colour but drops black, white and sizes", () => {
    const out = cleanPastedHtml(docs(`<p><span style="color:#ff0000;font-size:20pt">red</span> <span style="color:#000000">black</span> <span style="color:rgb(255,255,255)">white</span></p>`));
    expect(out).toBe('<p><span style="color: rgb(255, 0, 0)">red</span> black white</p>');
  });

  it("maps Heading 1 and 2 to the lesson heading, and Heading 3 and below to bold paragraphs", () => {
    const out = cleanPastedHtml(docs(`<h1><span>Chapter</span></h1><h2>Section</h2><h3>Detail</h3><h4>Smaller</h4>`));
    expect(out).toBe("<h2>Chapter</h2><h2>Section</h2><p><strong>Detail</strong></p><p><strong>Smaller</strong></p>");
  });

  it("keeps lists with their nesting", () => {
    const out = cleanPastedHtml(docs(`<ul><li><p><span>One</span></p><ul><li><p><span>Nested</span></p></li></ul></li><li><p><span>Two</span></p></li></ul>`));
    expect(out).toBe("<ul><li>One<ul><li>Nested</li></ul></li><li>Two</li></ul>");
  });

  it("unwraps Google's redirect links to the real address", () => {
    const out = cleanPastedHtml(docs(`<p><a href="https://www.google.com/url?q=https://example.org/page&amp;sa=D&amp;source=editors" style="color:#1155cc">link</a></p>`));
    expect(out).toBe('<p><a href="https://example.org/page">link</a></p>');
  });

  it("drops spacer line breaks between blocks and Docs' link colouring", () => {
    const out = cleanPastedHtml(docs(`<p>Text</p><br><p><a href="https://example.org/x"><span style="color:#1155cc;text-decoration:underline">link</span></a></p>`));
    expect(out).toBe('<p>Text</p><p><a href="https://example.org/x">link</a></p>');
  });

  it("keeps paragraph alignment and removes empty spacer paragraphs", () => {
    const out = cleanPastedHtml(docs(`<p style="text-align:center">Centered</p><p><br></p><p>&nbsp;</p><p>After</p>`));
    expect(out).toBe('<p class="ql-align-center">Centered</p><p>After</p>');
  });

  it("keeps tables, turning header cells into bold cells", () => {
    const out = cleanPastedHtml(docs(`<table><thead><tr><th>Head</th></tr></thead><tbody><tr><td><p>Cell</p></td></tr></tbody></table>`));
    expect(out).toContain("<td><strong>Head</strong></td>");
    expect(out).toContain("<td>Cell</td>");
    expect(out).not.toMatch(/thead|<th/);
  });
});

describe("cleanPastedHtml: Word", () => {
  it("rebuilds Word's list paragraphs as real lists, with levels and numbering", () => {
    const word = `<html><body><!--StartFragment-->
      <p class=MsoListParagraphCxSpFirst style='margin-left:.5in;text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;</span></span><![endif]>First<o:p></o:p></p>
      <p class=MsoListParagraphCxSpMiddle style='margin-left:1.0in;text-indent:-.25in;mso-list:l0 level2 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>o<span>&nbsp;&nbsp;</span></span><![endif]>Child<o:p></o:p></p>
      <p class=MsoListParagraphCxSpLast style='margin-left:.5in;text-indent:-.25in;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='mso-list:Ignore'>·<span>&nbsp;</span></span><![endif]>Second<o:p></o:p></p>
      <p class=MsoNormal>After the list</p><!--EndFragment--></body></html>`;
    expect(cleanPastedHtml(word)).toBe("<ul><li>First<ul><li>Child</li></ul></li><li>Second</li></ul><p>After the list</p>");
  });

  it("recognises a numbered Word list", () => {
    const word = `<p class=MsoListParagraph style='mso-list:l1 level1 lfo2'><span style='mso-list:Ignore'>1.<span>&nbsp;</span></span>Step one</p><p class=MsoListParagraph style='mso-list:l1 level1 lfo2'><span style='mso-list:Ignore'>2.<span>&nbsp;</span></span>Step two</p>`;
    expect(cleanPastedHtml(word)).toBe("<ol><li>Step one</li><li>Step two</li></ol>");
  });

  it("drops comments, Word namespaces and styles", () => {
    const out = cleanPastedHtml(`<style>p{color:red}</style><!--[if gte mso 9]><xml>x</xml><![endif]--><p class=MsoNormal><span style='font-family:"Calibri";mso-bidi-font-family:Arial'>Hello<o:p></o:p></span></p>`);
    expect(out).toBe("<p>Hello</p>");
  });
});

describe("cleanPastedHtml: general", () => {
  it("turns divs into paragraphs and removes source line breaks", () => {
    expect(cleanPastedHtml("<div>one\n   two</div><div>three</div>")).toBe("<p>one two</p><p>three</p>");
  });

  it("drops local images but keeps web ones", () => {
    const out = cleanPastedHtml(`<p><img src="file:///C:/x.png"><img src="https://cdn.example.com/a.png" alt="a" width="900" style="x"></p>`);
    expect(out).toBe('<p><img src="https://cdn.example.com/a.png" alt="a"></p>');
  });

  it("drops scripts and event handlers", () => {
    const out = cleanPastedHtml(`<p onclick="evil()">Hi<script>evil()</script></p>`);
    expect(out).toBe("<p>Hi</p>");
  });

  it("drops links that are not web or mail links, keeping their text", () => {
    expect(cleanPastedHtml(`<p><a href="javascript:evil()">click</a></p>`)).toBe("<p>click</p>");
  });

  it("joins runs of hard-wrapped paragraphs that came out of a PDF viewer as one paragraph per line", () => {
    const lines = [LONG, "the evening air grows cool and quiet across the whole valley of fields and the", "last birds settle into the trees for the night and the moon rises over it all."];
    const out = cleanPastedHtml(lines.map((l) => `<p>${l}</p>`).join(""));
    expect(out.match(/<p>/g)).toHaveLength(1);
  });

  it("leaves a handful of real paragraphs alone", () => {
    const out = cleanPastedHtml("<p>A short intro.</p><p>Another paragraph, of a different length entirely, ending properly.</p><p>Third.</p>");
    expect(out.match(/<p>/g)).toHaveLength(3);
  });
});

describe("planPaste", () => {
  it("cleans HTML pastes, and handles multi-line plain text", () => {
    expect(planPaste("<p><b>x</b></p>", "x")).toBe("<p><strong>x</strong></p>");
    expect(planPaste("", "• a\n• b")).toBe("<ul><li>a</li><li>b</li></ul>");
  });

  it("leaves single-line text and the editor's own content to the editor", () => {
    expect(planPaste("", "just one line")).toBeNull();
    expect(planPaste('<p class="ql-align-center">x</p>', "x")).toBeNull();
  });
});
