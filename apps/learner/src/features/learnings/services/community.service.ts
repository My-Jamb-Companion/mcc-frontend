import {apiClient} from "@mcc/api";

export interface ApiPostAuthor {
  user_id: string;
  full_name?: string | null;
  profile_photo_url?: string | null;
}

export interface ApiPost {
  post_id: string;
  author: ApiPostAuthor;
  body: string;
  reply_count: number;
  created_at: string;
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

/** Endpoint: POST /courses/<course_id>/community/posts */
export const createPost = async (
  courseId: string,
  body: string,
): Promise<{post_id: string}> => {
  const res = await apiClient.post<{data: {post_id: string}}>(
    `/courses/${courseId}/community/posts`,
    {body},
  );
  return res.data.data;
};

/** Endpoint: POST /courses/<course_id>/community/posts/<post_id>/report */
export const reportPost = async (
  courseId: string,
  postId: string,
  reason: string,
): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/community/posts/${postId}/report`, {reason});
};
