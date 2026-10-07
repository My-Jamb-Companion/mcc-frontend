export type BugStatus = "open" | "in_progress" | "resolved" | "wont_fix";
export type BugUrgency = "urgent" | "important" | "annoying";

export const STATUS_LABEL: Record<BugStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};

export const URGENCY_LABEL: Record<BugUrgency, string> = {
  urgent: "Urgent",
  important: "Important",
  annoying: "Just annoying",
};

export const URGENCY_STYLE: Record<BugUrgency, string> = {
  urgent: "bg-red-50 text-red-600",
  important: "bg-amber-50 text-amber-700",
  annoying: "bg-slate-100 text-slate-600",
};

export const STATUS_STYLE: Record<BugStatus, string> = {
  open: "bg-blue-50 text-blue-600",
  in_progress: "bg-violet-50 text-violet-600",
  resolved: "bg-green-50 text-green-600",
  wont_fix: "bg-slate-100 text-slate-500",
};

export const isClosed = (status: BugStatus): boolean => status === "resolved" || status === "wont_fix";

/** A reporter's page as something short to read: the path, without the site. Falls back to the text as given. */
export function prettyPage(pageUrl: string): string {
  try {
    const url = new URL(pageUrl);
    const path = url.pathname + url.search;
    return path === "/" ? url.host : path;
  } catch {
    return pageUrl;
  }
}

/** A link that is safe to open from the admin console (http/https only); null otherwise. */
export function safeLink(pageUrl: string): string | null {
  try {
    const url = new URL(pageUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Who reported it, for a row: the name, else the email, else a placeholder for deleted accounts. */
export function reporterLabel(report: {reporter_name: string | null; reporter_email: string | null}): string {
  return report.reporter_name?.trim() || report.reporter_email || "Deleted account";
}
