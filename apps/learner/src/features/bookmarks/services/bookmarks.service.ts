import {apiClient} from "@mcc/api";

export type BookmarkContentType = "course_lecture" | "exam_lecture";

export interface ApiBookmark {
  id: string;
  content_type: BookmarkContentType;
  content_id: string;
  title: string;
  parent_type: "course" | "exam";
  parent_id: string;
  parent_title: string;
  created_at: string;
}

/** Endpoint: GET /bookmarks */
export const getBookmarks = async (): Promise<ApiBookmark[]> => {
  const res = await apiClient.get<{data: {bookmarks: ApiBookmark[]}}>("/bookmarks");
  return res.data.data.bookmarks;
};

/** Endpoint: POST /bookmarks -- idempotent, safe to call on something already bookmarked. */
export const addBookmark = async (
  contentType: BookmarkContentType,
  contentId: string,
): Promise<{id: string}> => {
  const res = await apiClient.post<{data: {id: string}}>("/bookmarks", {
    content_type: contentType,
    content_id: contentId,
  });
  return res.data.data;
};

/** Endpoint: DELETE /bookmarks/{contentType}/{contentId} */
export const removeBookmark = async (
  contentType: BookmarkContentType,
  contentId: string,
): Promise<{removed: boolean}> => {
  const res = await apiClient.delete<{data: {removed: boolean}}>(
    `/bookmarks/${encodeURIComponent(contentType)}/${encodeURIComponent(contentId)}`,
  );
  return res.data.data;
};
