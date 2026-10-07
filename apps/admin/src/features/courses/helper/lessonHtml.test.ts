import {describe, expect, it} from "vitest";
import {normalizeLessonHtml, relaxSpaces} from "./lessonHtml";

const ui = '<span class="ql-ui" contenteditable="false"></span>';
const li = (list: string, text: string, indent = 0) =>
  `<li data-list="${list}"${indent ? ` class="ql-indent-${indent}"` : ""}>${ui}${text}</li>`;

describe("normalizeLessonHtml", () => {
  it("leaves ordinary content alone", () => {
    const html = "<p>Hello <strong>world</strong></p><h3>Sub</h3>";
    expect(normalizeLessonHtml(html)).toBe(html);
    expect(normalizeLessonHtml("")).toBe("");
  });

  it("removes Quill's empty bullet/number decoration", () => {
    expect(normalizeLessonHtml(`<p>${ui}text</p>`)).toBe("<p>text</p>");
  });

  it("turns Quill's bullet list into a real <ul>", () => {
    const out = normalizeLessonHtml(`<ol>${li("bullet", "one")}${li("bullet", "two")}</ol>`);
    expect(out).toBe("<ul><li>one</li><li>two</li></ul>");
  });

  it("turns an ordered list into a real <ol>", () => {
    expect(normalizeLessonHtml(`<ol>${li("ordered", "a")}${li("ordered", "b")}</ol>`)).toBe("<ol><li>a</li><li>b</li></ol>");
  });

  it("nests indented items inside the item above", () => {
    const out = normalizeLessonHtml(`<ol>${li("bullet", "top")}${li("bullet", "child", 1)}${li("bullet", "grandchild", 2)}${li("bullet", "next top")}</ol>`);
    expect(out).toBe("<ul><li>top<ul><li>child<ul><li>grandchild</li></ul></li></ul></li><li>next top</li></ul>");
  });

  it("starts a new list when the kind changes at the same level, and allows numbers inside bullets", () => {
    expect(normalizeLessonHtml(`<ol>${li("bullet", "b")}${li("ordered", "n")}</ol>`)).toBe("<ul><li>b</li></ul><ol><li>n</li></ol>");
    expect(normalizeLessonHtml(`<ol>${li("bullet", "b")}${li("ordered", "n", 1)}</ol>`)).toBe("<ul><li>b<ol><li>n</li></ol></li></ul>");
  });

  it("marks checklist items", () => {
    const out = normalizeLessonHtml(`<ol>${li("checked", "done")}${li("unchecked", "todo")}</ol>`);
    expect(out).toContain('<li class="lesson-task lesson-task-checked">done</li>');
    expect(out).toContain('<li class="lesson-task lesson-task-unchecked">todo</li>');
  });

  it("does not skip a level if the data jumps", () => {
    expect(normalizeLessonHtml(`<ol>${li("bullet", "a")}${li("bullet", "deep", 3)}</ol>`)).toBe("<ul><li>a<ul><li>deep</li></ul></li></ul>");
  });

  it("leaves already-real lists (no data-list) untouched", () => {
    const html = "<ul><li>a<ul><li>b</li></ul></li></ul>";
    expect(normalizeLessonHtml(html)).toBe(html);
  });

  it("handles text before, between and after lists", () => {
    const out = normalizeLessonHtml(`<p>Before</p><ol>${li("bullet", "x")}</ol><p>Between</p><ol>${li("ordered", "y")}</ol><p>After</p>`);
    expect(out).toBe("<p>Before</p><ul><li>x</li></ul><p>Between</p><ol><li>y</li></ol><p>After</p>");
  });

  it("keeps inline formatting and links inside list items", () => {
    const out = normalizeLessonHtml(`<ol>${li("bullet", '<strong>bold</strong> and <a href="https://x.test">link</a>')}</ol>`);
    expect(out).toBe('<ul><li><strong>bold</strong> and <a href="https://x.test">link</a></li></ul>');
  });
});

describe("relaxSpaces (Quill writes every space as &nbsp;, which can never wrap)", () => {
  it("turns non-breaking spaces back into ordinary ones", () => {
    expect(relaxSpaces("<p>Time&nbsp;management&nbsp;is&nbsp;<strong>a&nbsp;skill</strong></p>")).toBe("<p>Time management is <strong>a skill</strong></p>");
    expect(relaxSpaces("a\u00a0b")).toBe("a b");
  });

  it("leaves code blocks alone, where spacing is literal", () => {
    expect(relaxSpaces("<p>a&nbsp;b</p><pre>x&nbsp;&nbsp;y</pre><p>c&nbsp;d</p>")).toBe("<p>a b</p><pre>x&nbsp;&nbsp;y</pre><p>c d</p>");
  });

  it("copes with empty input", () => {
    expect(relaxSpaces("")).toBe("");
  });
});

describe("normalizeLessonHtml: spacing and blank lines", () => {
  it("makes saved lessons wrap normally and drops blank paragraphs", () => {
    expect(normalizeLessonHtml("<p>one&nbsp;two</p><p><br></p><p>&nbsp;</p><p>three</p>")).toBe("<p>one two</p><p>three</p>");
  });

  it("keeps a paragraph that holds an image", () => {
    expect(normalizeLessonHtml('<p><img src="https://x.test/a.png"></p>')).toBe('<p><img src="https://x.test/a.png"></p>');
  });
});
