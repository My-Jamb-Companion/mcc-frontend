import type { CommunityPost, FeedMode } from "./community.service";

/** The most questions that can be pinned in a course at once (the server refuses a fourth). */
export const MAX_PINNED = 3;

export const FEED_MODES: { value: FeedMode; label: string }[] = [
  { value: "new", label: "Newest" },
  { value: "top", label: "Top" },
  { value: "unanswered", label: "Unanswered" },
];

export function pinnedCount(posts: Pick<CommunityPost, "pinned">[]): number {
  return posts.filter((p) => p.pinned).length;
}

/** Whether pinning one more is allowed, so the button can say why not instead of failing. */
export function canPinMore(posts: Pick<CommunityPost, "pinned">[]): boolean {
  return pinnedCount(posts) < MAX_PINNED;
}

export function answersLabel(count: number): string {
  if (count <= 0) return "No answers yet";
  return count === 1 ? "1 answer" : `${count} answers`;
}

/** What the teacher is told is about to happen when they remove a post. */
export function removeWarning(authorName: string | null | undefined): string {
  return `${authorName || "The author"} will be told it was removed. A third removal in 30 days mutes them from posting for a week.`;
}
