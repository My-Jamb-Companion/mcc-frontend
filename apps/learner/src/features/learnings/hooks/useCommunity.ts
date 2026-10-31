import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  FeedMode,
  acceptGuidelines,
  acceptReply,
  createPost,
  deletePost,
  getGuidelines,
  getPosts,
  getReplies,
  reportPost,
  setVote,
  updatePost,
} from "../services/community.service";

const ROOT = (courseId: string) => ["courses", courseId, "community"] as const;

export const useCommunityPosts = (courseId: string | null | undefined, mode: FeedMode = "new") => {
  const query = useQuery({
    queryKey: courseId ? [...ROOT(courseId), "feed", mode] : ["courses", "community", "disabled"],
    queryFn: () => getPosts(courseId as string, mode),
    enabled: !!courseId,
  });
  return {...query, posts: query.data?.posts ?? [], meta: query.data?.meta ?? null};
};

/** The answers to one question; only fetched once the thread is opened. */
export const useReplies = (courseId: string, postId: string, enabled: boolean) => {
  const query = useQuery({
    queryKey: [...ROOT(courseId), "replies", postId],
    queryFn: () => getReplies(courseId, postId),
    enabled,
  });
  return {...query, replies: query.data?.replies ?? [], acceptedReplyId: query.data?.acceptedReplyId ?? null};
};

export const useCreatePost = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({body, parentPostId}: {body: string; parentPostId?: string}) => createPost(courseId, body, parentPostId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};

export const useUpdatePost = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({postId, body}: {postId: string; body: string}) => updatePost(courseId, postId, body),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};

export const useDeletePost = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePost(courseId, postId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};

export const useVote = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({postId, on}: {postId: string; on: boolean}) => setVote(courseId, postId, on),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};

export const useAcceptReply = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({questionId, replyId}: {questionId: string; replyId: string | null}) =>
      acceptReply(courseId, questionId, replyId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT(courseId)}),
  });
};

export const useGuidelines = (enabled: boolean) =>
  useQuery({queryKey: ["community", "guidelines"], queryFn: getGuidelines, enabled});

export const useAcceptGuidelines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptGuidelines,
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["community", "guidelines"]}),
  });
};

export const useReportPost = (courseId: string) => {
  return useMutation({
    mutationFn: ({postId, reason}: {postId: string; reason: string}) => reportPost(courseId, postId, reason),
  });
};
