"use client";

import {Icon} from "@mcc/ui";
import {BookmarkContentType} from "./services/bookmarks.service";
import {useAddBookmark, useBookmarkedIds, useRemoveBookmark} from "./hooks/useBookmarks";

/** A standalone toggle -- never nested inside another button, since lecture
 * rows elsewhere are themselves full-row buttons and HTML forbids nesting
 * them. Stops propagation so it can still sit inside a clickable row. */
export default function BookmarkButton({
  contentType,
  contentId,
  className = "",
}: {
  contentType: BookmarkContentType;
  contentId: string;
  className?: string;
}) {
  const bookmarkedIds = useBookmarkedIds();
  const isBookmarked = bookmarkedIds.has(contentId);
  const addMutation = useAddBookmark();
  const removeMutation = useRemoveBookmark();
  const isPending = addMutation.isPending || removeMutation.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPending) return;
    if (isBookmarked) {
      removeMutation.mutate({contentType, contentId});
    } else {
      addMutation.mutate({contentType, contentId});
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this lecture"}
      className={`shrink-0 disabled:opacity-50 ${className}`}
    >
      <Icon
        icon={isBookmarked ? "solar:bookmark-bold" : "solar:bookmark-linear"}
        size={16}
        className={isBookmarked ? "text-primary" : "text-subtle hover:text-primary transition-colors"}
      />
    </button>
  );
}
