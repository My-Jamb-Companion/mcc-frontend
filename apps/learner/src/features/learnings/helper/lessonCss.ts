/**
 * How lesson content looks for a student. Replaces Tailwind's (uninstalled) `prose` and
 * Quill's own stylesheet: headings, paragraphs, lists, quotes, code, links, tables and
 * the formats Quill writes as classes (alignment, indent, size, font, direction).
 * Identical in apps/admin (features/courses/helper/lessonCss.ts).
 */
export const LESSON_CONTENT_CSS = `
.lesson-block-content {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: #1f2937;
  overflow-wrap: anywhere;
  /* A comfortable line length on wide screens, instead of running edge to edge. */
  max-width: 46rem;
}
.lesson-block-content > :first-child { margin-top: 0; }
.lesson-block-content > :last-child { margin-bottom: 0; }
.lesson-block-content p { margin: 0 0 1rem; }
.lesson-block-content p:empty { display: none; }
.lesson-block-content h1, .lesson-block-content h2, .lesson-block-content h3,
.lesson-block-content h4, .lesson-block-content h5, .lesson-block-content h6 {
  font-weight: 700; line-height: 1.35; margin: 1.75rem 0 0.75rem; color: #111827;
}
.lesson-block-content h1 { font-size: 1.6rem; }
.lesson-block-content h2 { font-size: 1.4rem; }
.lesson-block-content h3 { font-size: 1.2rem; }
.lesson-block-content h4, .lesson-block-content h5, .lesson-block-content h6 { font-size: 1.05rem; }
.lesson-block-content strong, .lesson-block-content b { font-weight: 700; }
.lesson-block-content em, .lesson-block-content i { font-style: italic; }
.lesson-block-content u { text-decoration: underline; }
.lesson-block-content s, .lesson-block-content strike { text-decoration: line-through; }
.lesson-block-content sub { vertical-align: sub; font-size: 0.75em; }
.lesson-block-content sup { vertical-align: super; font-size: 0.75em; }
.lesson-block-content a { color: #6c2bd9; text-decoration: underline; text-underline-offset: 2px; }
.lesson-block-content a:hover { text-decoration-thickness: 2px; }
.lesson-block-content ul, .lesson-block-content ol { margin: 0 0 1rem; padding-left: 1.6rem; }
.lesson-block-content ul { list-style: disc; }
.lesson-block-content ol { list-style: decimal; }
.lesson-block-content ul ul { list-style: circle; }
.lesson-block-content ul ul ul { list-style: square; }
.lesson-block-content ol ol { list-style: lower-alpha; }
.lesson-block-content ol ol ol { list-style: lower-roman; }
.lesson-block-content li { margin: 0.25rem 0; padding-left: 0.2rem; }
.lesson-block-content li > ul, .lesson-block-content li > ol { margin: 0.25rem 0 0; }
.lesson-block-content li > p { margin: 0; }
.lesson-block-content .lesson-task { list-style: none; margin-left: -1.4rem; }
.lesson-block-content .lesson-task::before { margin-right: 0.5rem; }
.lesson-block-content .lesson-task-unchecked::before { content: "\\2610"; }
.lesson-block-content .lesson-task-checked::before { content: "\\2611"; }
.lesson-block-content blockquote {
  margin: 0 0 1rem; padding: 0.25rem 0 0.25rem 1rem; border-left: 4px solid #d1d5db; color: #4b5563;
}
.lesson-block-content pre, .lesson-block-content .ql-code-block-container {
  margin: 0 0 1rem; padding: 0.75rem 1rem; border-radius: 0.5rem; background: #111827; color: #f9fafb;
  font-size: 0.9rem; line-height: 1.6; overflow-x: auto; white-space: pre-wrap;
}
.lesson-block-content code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; }
.lesson-block-content :not(pre) > code { background: #f3f4f6; padding: 0.1rem 0.35rem; border-radius: 0.25rem; }
.lesson-block-content hr { margin: 1.5rem 0; border: 0; border-top: 1px solid #e5e7eb; }
.lesson-block-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5rem 0; }
.lesson-block-content table { width: 100%; border-collapse: collapse; margin: 0 0 1rem; font-size: 0.95rem; }
.lesson-block-content th, .lesson-block-content td {
  border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; vertical-align: top;
}
.lesson-block-content th { background: #f9fafb; font-weight: 600; }

/* The formats Quill writes as classes. */
.lesson-block-content .ql-align-center { text-align: center; }
.lesson-block-content .ql-align-right { text-align: right; }
.lesson-block-content .ql-align-justify { text-align: justify; }
.lesson-block-content .ql-direction-rtl { direction: rtl; text-align: right; }
.lesson-block-content .ql-size-small { font-size: 0.8em; }
.lesson-block-content .ql-size-large { font-size: 1.35em; }
.lesson-block-content .ql-size-huge { font-size: 1.9em; }
.lesson-block-content .ql-font-serif { font-family: Georgia, "Times New Roman", serif; }
.lesson-block-content .ql-font-monospace { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.lesson-block-content .ql-indent-1 { padding-left: 2rem; }
.lesson-block-content .ql-indent-2 { padding-left: 4rem; }
.lesson-block-content .ql-indent-3 { padding-left: 6rem; }
.lesson-block-content .ql-indent-4 { padding-left: 8rem; }
.lesson-block-content .ql-indent-5 { padding-left: 10rem; }
.lesson-block-content .ql-indent-6 { padding-left: 12rem; }
.lesson-block-content .ql-indent-7 { padding-left: 14rem; }
.lesson-block-content .ql-indent-8 { padding-left: 16rem; }

@media (max-width: 640px) {
  .lesson-block-content { font-size: 1rem; line-height: 1.75; }
  .lesson-block-content .ql-indent-1, .lesson-block-content .ql-indent-2, .lesson-block-content .ql-indent-3,
  .lesson-block-content .ql-indent-4, .lesson-block-content .ql-indent-5, .lesson-block-content .ql-indent-6,
  .lesson-block-content .ql-indent-7, .lesson-block-content .ql-indent-8 { padding-left: 1.25rem; }
  .lesson-block-content table { display: block; overflow-x: auto; }
}
`;
