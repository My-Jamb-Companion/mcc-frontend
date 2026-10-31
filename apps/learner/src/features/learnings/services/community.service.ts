import {apiClient} from "@mcc/api";

export interface ApiPostAuthor {
  user_id: string;
  full_name?: string | null;
  profile_photo_url?: string | null;
}

/** Only the author ever sees held or hidden: held = the automatic check flagged it and a moderator will look,
 * hidden = several people reported it and a moderator will look. Absent from an older backend (means visible). */
export type PostStatus = "visible" | "held" | "hidden";

export interface ApiPost {
  post_id: string;
  author: ApiPostAuthor;
  body: string;
  reply_count: number;
  created_at: string;
  status?: PostStatus;
  is_mine?: boolean;
  /** The caller wrote it and is inside the 15-minute edit window. */
  can_edit?: boolean;
  edited?: boolean;
}

/** The longest a post can be; the backend refuses more. */
export const MAX_POST_LENGTH = 2000;

export interface PostResult {
  post_id: string;
  status?: PostStatus | "removed";
  /** Set when the post is not shown yet (held for a moderator). */
  message?: string | null;
}

export interface ApiPostListMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Endpoint: GET /courses/<course_id>/community
 *
 * Top-level posts only, newest first -- there's no thread-fetch endpoint
 * yet, so a reply can be created (parent_post_id) but not read back inline.
 */
export const getPosts = async (
  courseId: string,
  page = 1,
): Promise<{posts: ApiPost[]; meta: ApiPostListMeta}> => {
  const res = await apiClient.get<{data: ApiPost[]; meta: ApiPostListMeta}>(
    `/courses/${courseId}/community`,
    {params: {page, limit: 20}},
  );
  return {posts: res.data.data, meta: res.data.meta};
};

/**
 * Endpoint: POST /courses/<course_id>/community/posts
 *
 * Refused with 422 CONTENT_NOT_ALLOWED for phone numbers, emails, handles and links (the message is written for the
 * learner), 403 NOT_ENROLLED outside the course, 429 past 5 posts an hour. A post about leaked exam questions comes
 * back with status "held" and a message.
 */
export const createPost = async (courseId: string, body: string): Promise<PostResult> => {
  const res = await apiClient.post<{data: PostResult}>(`/courses/${courseId}/community/posts`, {body});
  return res.data.data;
};

/** Endpoint: PATCH /courses/<course_id>/community/posts/<post_id> -- your own post, first 15 minutes only. */
export const updatePost = async (courseId: string, postId: string, body: string): Promise<PostResult> => {
  const res = await apiClient.patch<{data: PostResult}>(`/courses/${courseId}/community/posts/${postId}`, {body});
  return res.data.data;
};

/** Endpoint: DELETE /courses/<course_id>/community/posts/<post_id> -- your own post, any time. */
export const deletePost = async (courseId: string, postId: string): Promise<void> => {
  await apiClient.delete(`/courses/${courseId}/community/posts/${postId}`);
};

/** Endpoint: POST /courses/<course_id>/community/posts/<post_id>/report */
export const reportPost = async (
  courseId: string,
  postId: string,
  reason: string,
): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/community/posts/${postId}/report`, {reason});
};
