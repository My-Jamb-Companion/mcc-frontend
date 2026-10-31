import { apiClient } from "@mcc/api";

export interface CommunityAuthor {
  user_id: string;
  full_name?: string | null;
  badge?: "Teacher" | "Moderator" | null;
}

export interface CommunityPost {
  post_id: string;
  author: CommunityAuthor;
  body: string;
  created_at: string;
  status?: "visible" | "held" | "hidden";
  reply_count: number;
  vote_count?: number;
  pinned?: boolean;
  answered?: boolean;
  accepted_reply_id?: string | null;
}

export interface CommunityReply {
  post_id: string;
  author: CommunityAuthor;
  body: string;
  created_at: string;
  vote_count?: number;
  is_accepted?: boolean;
}

export type FeedMode = "new" | "top" | "unanswered";

/** Endpoint: GET /courses/<course_id>/community -- the teacher of the course can read it. Pinned questions first. */
export const getPosts = async (courseId: string, mode: FeedMode): Promise<CommunityPost[]> => {
  const res = await apiClient.get<{ data: CommunityPost[] }>(`/courses/${courseId}/community`, {
    params: { limit: 50, sort: mode === "top" ? "top" : "new", unanswered: mode === "unanswered" ? true : undefined },
  });
  return res.data.data;
};

/** Endpoint: GET /courses/<course_id>/community/posts/<post_id>/replies */
export const getReplies = async (courseId: string, postId: string): Promise<CommunityReply[]> => {
  const res = await apiClient.get<{ data: { items: CommunityReply[] } }>(
    `/courses/${courseId}/community/posts/${postId}/replies`,
  );
  return res.data.data.items;
};

/** Endpoint: POST /courses/<course_id>/community/posts -- an answer when parentPostId is set. */
export const createPost = async (courseId: string, body: string, parentPostId?: string): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/community/posts`, { body, parent_post_id: parentPostId });
};

/** Endpoint: DELETE /courses/<course_id>/community/posts/<post_id> -- the teacher can remove anyone's post in the course. */
export const removePost = async (courseId: string, postId: string): Promise<void> => {
  await apiClient.delete(`/courses/${courseId}/community/posts/${postId}`);
};

/** Endpoint: PUT | DELETE /courses/<course_id>/community/posts/<post_id>/pin -- at most 3 at a time. */
export const setPinned = async (courseId: string, postId: string, pinned: boolean): Promise<void> => {
  await apiClient.request({ method: pinned ? "PUT" : "DELETE", url: `/courses/${courseId}/community/posts/${postId}/pin` });
};

/** Endpoint: PUT /courses/<course_id>/community/posts/<question_id>/accepted-reply */
export const acceptReply = async (courseId: string, questionId: string, replyId: string | null): Promise<void> => {
  await apiClient.put(`/courses/${courseId}/community/posts/${questionId}/accepted-reply`, { reply_id: replyId });
};
