"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders Brainy's replies as formatted text.
 *
 * The model answers in Markdown, and this used to be dumped into a
 * `whitespace-pre-wrap` <p>, so students read literal `**bold**` and `##`.
 *
 * Raw HTML is deliberately NOT enabled (no rehype-raw), which is what makes
 * this safe to point at model output without a sanitizer: react-markdown
 * drops embedded HTML rather than rendering it.
 *
 * Styling is hand-written per element rather than via @tailwindcss/typography
 * (not installed) so it stays on the app's own tokens. Note the dark theme
 * only overrides --background/--foreground, so anything here either uses
 * those, or a translucent muted (`bg-muted/10`) that works on both grounds --
 * never --hint, which is near-invisible on the dark background.
 */
export default function MarkdownMessage({content}: {content: string}) {
  return (
    <div className="text-sm leading-relaxed text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => (
            <h1 className="mt-5 mb-2 text-lg font-semibold text-foreground">
              {children}
            </h1>
          ),
          h2: ({children}) => (
            <h2 className="mt-5 mb-2 text-base font-semibold text-foreground">
              {children}
            </h2>
          ),
          h3: ({children}) => (
            <h3 className="mt-4 mb-1.5 text-sm font-semibold text-foreground">
              {children}
            </h3>
          ),
          h4: ({children}) => (
            <h4 className="mt-4 mb-1.5 text-sm font-semibold text-muted">
              {children}
            </h4>
          ),
          p: ({children}) => <p className="my-2 leading-relaxed">{children}</p>,
          ul: ({children}) => (
            <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({children}) => (
            <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({children}) => <li className="leading-relaxed">{children}</li>,
          strong: ({children}) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({children}) => <em className="italic">{children}</em>,
          a: ({href, children}) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80 dark:text-violet-400"
            >
              {children}
            </a>
          ),
          blockquote: ({children}) => (
            <blockquote className="my-3 border-l-2 border-primary/40 pl-3 text-muted italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-muted/20" />,
          // `pre` owns the code-block chrome; the arbitrary-variant rules strip
          // the inline-chip styling off the `code` it wraps. Doing it this way
          // avoids guessing inline-vs-block from props -- react-markdown v10
          // dropped the `inline` flag, and a language-less fence has no
          // className to test either.
          pre: ({children}) => (
            <pre className="my-3 overflow-x-auto rounded-lg bg-muted/10 p-3 text-xs border border-muted/20 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-xs [&>code]:text-foreground">
              {children}
            </pre>
          ),
          code: ({children}) => (
            <code className="rounded bg-muted/15 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              {children}
            </code>
          ),
          // GFM tables need their own horizontal scroll -- a wide table must
          // not stretch the chat column.
          table: ({children}) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({children}) => (
            <thead className="border-b border-muted/30">{children}</thead>
          ),
          th: ({children}) => (
            <th className="px-2 py-1.5 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="border-t border-muted/15 px-2 py-1.5 align-top">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
