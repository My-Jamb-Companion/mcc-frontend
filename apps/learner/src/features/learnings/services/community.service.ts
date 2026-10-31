import {apiClient} from "@mcc/api";

export interface ApiPostAuthor {
  user_id: string;
  /** A learner under 18 is shown by first name only, with no photo. */
  full_name?: string | null;
  profile_photo_url?: string | null;
  /** Set for the course's teacher and for admins. */
  badge?: "Teacher" | "Moderator" | null;
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
  vote_count?: number;
  i_voted?: boolean;
  /** Pinned by the teacher: always at the top. */
  pinned?: boolean;
  /** Has an accepted answer, or a reply from the teacher. */
  answered?: boolean;
  accepted_reply_id?: string | null;
}

/** An answer to a question. */
export interface ApiReply {
  post_id: string;
  author: ApiPostAuthor;
  body: string;
  created_at: string;
  status?: PostStatus;
  is_mine?: boolean;
  can_edit?: boolean;
  edited?: boolean;
  vote_count?: number;
  i_voted?: boolean;
  is_accepted?: boolean;
}

export type FeedMode = "new" | "top" | "unanswered";

export interface Guidelines {
  version: number;
  title: string;
  rules: string[];
  consequences: string;
  accepted: boolean;
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
 * Questions (top-level posts), pinned first. `mode` is newest first, most voted first, or only the questions nobody
 * has answered yet. Answers come from getReplies, per question.
 */
export const getPosts = async (
  courseId: string,
  mode: FeedMode = "new",
  page = 1,
): Promise<{posts: ApiPost[]; meta: ApiPostListMeta}> => {
  const res = await apiClient.get<{data: ApiPost[]; meta: ApiPostListMeta}>(`/courses/${courseId}/community`, {
    params: {page, limit: 20, sort: mode === "top" ? "top" : "new", unanswered: mode === "unanswered" ? true : undefined},
  });
  return {posts: res.data.data, meta: res.data.meta};
};

/** Endpoint: GET /courses/<course_id>/community/posts/<post_id>/replies -- accepted answer first. */
export const getReplies = async (
  courseId: string,
  postId: string,
): Promise<{replies: ApiReply[]; acceptedReplyId: string | null}> => {
  const res = await apiClient.get<{data: {items: ApiReply[]; accepted_reply_id: string | null}}>(
    `/courses/${courseId}/community/posts/${postId}/replies`,
  );
  return {replies: res.data.data.items, acceptedReplyId: res.data.data.accepted_reply_id};
};

/** Endpoint: PUT | DELETE /courses/<course_id>/community/posts/<post_id>/vote -- never your own post. */
export const setVote = async (courseId: string, postId: string, on: boolean): Promise<void> => {
  await apiClient.request({method: on ? "PUT" : "DELETE", url: `/courses/${courseId}/community/posts/${postId}/vote`});
};

/** Endpoint: PUT /courses/<course_id>/community/posts/<question_id>/accepted-reply -- the asker or the teacher. */
export const acceptReply = async (courseId: string, questionId: string, replyId: string | null): Promise<void> => {
  await apiClient.put(`/courses/${courseId}/community/posts/${questionId}/accepted-reply`, {reply_id: replyId});
};

/** Endpoint: GET /community/guidelines -- the rules, and whether this person has agreed to them. */
export const getGuidelines = async (): Promise<Guidelines> => {
  const res = await apiClient.get<{data: Guidelines}>("/community/guidelines");
  return res.data.data;
};

/** Endpoint: POST /community/guidelines/accept -- needed once before a student's first post. */
export const acceptGuidelines = async (): Promise<void> => {
  await apiClient.post("/community/guidelines/accept");
};

/**
 * Endpoint: POST /courses/<course_id>/community/posts (a reply when parentPostId is set)
 *
 * Refused with 422 CONTENT_NOT_ALLOWED for phone numbers, emails, handles and links (the message is written for the
 * learner), 403 NOT_ENROLLED outside the course, 403 GUIDELINES_REQUIRED until the rules are accepted, 403 COMMUNITY_MUTED, 429 past 5 posts an hour. A post about leaked exam questions comes
 * back with status "held" and a message.
 */
export const createPost = async (courseId: string, body: string, parentPostId?: string): Promise<PostResult> => {
  const res = await apiClient.post<{data: PostResult}>(`/courses/${courseId}/community/posts`, {
    body,
    parent_post_id: parentPostId,
  });
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
