"use client";

import {useRouter} from "next/navigation";
import {Icon} from "@mcc/ui";
import {useBookmarks, useRemoveBookmark} from "./hooks/useBookmarks";
import {ApiBookmark} from "./services/bookmarks.service";

function BookmarkRow({bookmark}: {bookmark: ApiBookmark}) {
  const router = useRouter();
  const removeMutation = useRemoveBookmark();

  const goToLecture = () => {
    const href =
      bookmark.parent_type === "course"
        ? `/learnings/course/${bookmark.parent_id}?lecture=${bookmark.content_id}`
        : `/learnings/exams/${bookmark.parent_id}?lecture=${bookmark.content_id}`;
    router.push(href);
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-muted/20 p-4">
      <button onClick={goToLecture} className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium truncate">{bookmark.title}</p>
        <p className="text-xs text-subtle truncate mt-0.5">
          {bookmark.parent_type === "course" ? "Course" : "Exam prep"} -- {bookmark.parent_title}
        </p>
      </button>
      <button
        type="button"
        onClick={() =>
          removeMutation.mutate({contentType: bookmark.content_type, contentId: bookmark.content_id})
        }
        disabled={removeMutation.isPending}
        aria-label="Remove bookmark"
        className="shrink-0 ml-3 text-subtle hover:text-danger transition-colors disabled:opacity-50"
      >
        <Icon icon="solar:bookmark-bold" size={18} className="text-primary" />
      </button>
    </div>
  );
}

export default function Bookmarks() {
  const {bookmarks, isLoading, isError} = useBookmarks();

  return (
    <div className="flex flex-col gap-3">
      {isLoading && <p className="text-sm text-muted py-8 text-center">Loading…</p>}
      {isError && (
        <p className="text-sm text-danger py-8 text-center">Couldn&apos;t load your bookmarks.</p>
      )}
      {!isLoading && !isError && bookmarks.length === 0 && (
        <p className="text-sm text-muted py-8 text-center">
          No bookmarks yet. Bookmark a lecture from a course or exam-prep program to find it here.
        </p>
      )}
      {bookmarks.map((bookmark) => (
        <BookmarkRow key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
}
