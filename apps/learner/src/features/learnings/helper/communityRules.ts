import type {ApiPost} from "../services/community.service";

export {MAX_POST_LENGTH} from "../services/community.service";

/** Shown above the composer, so people know what the space is for before they write anything. */
export const COMMUNITY_GUIDELINES =
  "This space is for questions and answers about this course. Please don't share phone numbers, links or social " +
  "handles, and never ask for or offer exam questions or answers. Posts that break these rules are removed.";

/** Why a post is being reported. The chosen label is what a moderator reads. */
export const REPORT_REASONS = [
  {value: "off_topic", label: "Off topic"},
  {value: "abuse", label: "Rude or abusive"},
  {value: "exam_leak", label: "Exam leak or cheating"},
  {value: "contact", label: "Selling, or asking to chat privately"},
  {value: "other", label: "Something else"},
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export function reportReasonLabel(value: ReportReason | string): string {
  return REPORT_REASONS.find((r) => r.value === value)?.label ?? "Something else";
}

/** The character counter only appears when the limit is getting close, so it never nags. */
export function counterText(length: number, max: number): string | null {
  return length >= max * 0.75 ? `${length} / ${max}` : null;
}

export function overLimit(length: number, max: number): boolean {
  return length > max;
}

/** What the author is told about a post that other people cannot see yet. */
export function reviewNotice(post: Pick<ApiPost, "status" | "is_mine">): string | null {
  if (!post.is_mine) return null;
  if (post.status === "held") return "Waiting for a moderator to review it. Only you can see it until then.";
  if (post.status === "hidden") return "Hidden while a moderator looks at it. Only you can see it until then.";
  return null;
}

/** Anyone can report a visible post that is not their own. */
export function canReport(post: Pick<ApiPost, "status" | "is_mine">): boolean {
  return !post.is_mine && (post.status ?? "visible") === "visible";
}

export const FEED_MODES = [
  {value: "new", label: "Newest"},
  {value: "top", label: "Top"},
  {value: "unanswered", label: "Unanswered"},
] as const;

/** The server's error code for a failed request ("GUIDELINES_REQUIRED", "COMMUNITY_MUTED", "NOT_ENROLLED", ...). */
export function errorCode(error: unknown): string | null {
  const code = (error as {response?: {data?: {error?: {code?: unknown}}}})?.response?.data?.error?.code;
  return typeof code === "string" ? code : null;
}

/** "Be first to answer", "1 answer", "3 answers". */
export function answersLabel(count: number): string {
  if (count <= 0) return "Be first to answer";
  return count === 1 ? "1 answer" : `${count} answers`;
}

/** Posts a person can vote on: someone else's, and showing. */
export function canVote(post: {is_mine?: boolean; status?: string}): boolean {
  return !post.is_mine && (post.status ?? "visible") === "visible";
}

/** Who may mark an answer as accepted: the person who asked (the teacher does it from the teacher app). */
export function canAccept(question: {is_mine?: boolean}): boolean {
  return !!question.is_mine;
}
