/** Plain text from a template's rich-text body (the browser reads it as text, so nothing in it can run). */
export function htmlToText(html: string): string {
  if (typeof DOMParser === "undefined") return html.replace(/<\/?[A-Za-z][^>]*>/g, "").trim();
  const withBreaks = html
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/(p|div|h[1-6]|li|tr)>|<br\s*\/?>/gi, "\n");
  const text = new DOMParser().parseFromString(withBreaks, "text/html").body.textContent ?? "";
  return text.split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** "Sam Student", or the email when they have no name. */
export const displayName = (p: {full_name: string | null; email: string}) => p.full_name?.trim() || p.email;

/** Short form for a list: time today, "Yesterday", or the date. */
export function listTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, now)) return d.toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"});
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", {day: "numeric", month: "short", ...(d.getFullYear() === now.getFullYear() ? {} : {year: "numeric"})});
}

/** Full form for a message in a thread. */
export const messageTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {day: "numeric", month: "short", hour: "numeric", minute: "2-digit"});

/** The preview line under a name: who spoke last, then what they said. */
export const previewLine = (c: {last_direction: "outbound" | "inbound"; last_body: string}) =>
  `${c.last_direction === "outbound" ? "You: " : ""}${c.last_body}`;

export const MAX_REPLY_LENGTH = 4000;
