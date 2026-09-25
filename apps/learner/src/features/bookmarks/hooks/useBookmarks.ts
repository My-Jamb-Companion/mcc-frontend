import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {
  addBookmark,
  BookmarkContentType,
  getBookmarks,
  removeBookmark,
} from "../services/bookmarks.service";

const BOOKMARKS_KEY = ["bookmarks"];

export const useBookmarks = () => {
  const query = useQuery({queryKey: BOOKMARKS_KEY, queryFn: getBookmarks});
  return {...query, bookmarks: query.data ?? []};
};

/** Set of bookmarked content_ids, for a cheap "is this lecture bookmarked?"
 * check anywhere a lecture list renders -- shares the same query cache the
 * full bookmarks list/page uses, so toggling a bookmark updates both. */
export const useBookmarkedIds = () => {
  const {bookmarks} = useBookmarks();
  return new Set(bookmarks.map((b) => b.content_id));
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({contentType, contentId}: {contentType: BookmarkContentType; contentId: string}) =>
      addBookmark(contentType, contentId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: BOOKMARKS_KEY}),
    onError: (error) => showError(extractApiError(error, "Couldn't save that bookmark")),
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({contentType, contentId}: {contentType: BookmarkContentType; contentId: string}) =>
      removeBookmark(contentType, contentId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: BOOKMARKS_KEY}),
    onError: (error) => showError(extractApiError(error, "Couldn't remove that bookmark")),
  });
};
