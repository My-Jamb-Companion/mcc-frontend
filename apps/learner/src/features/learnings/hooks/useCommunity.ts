import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {createPost, deletePost, getPosts, reportPost, updatePost} from "../services/community.service";

const ROOT = (courseId: string) => ["courses", courseId, "community"] as const;

export const useCommunityPosts = (courseId: string | null | undefined) => {
  const query = useQuery({
    queryKey: courseId ? ROOT(courseId) : ["courses", "community", "disabled"],
    queryFn: () => getPosts(courseId as string),
    enabled: !!courseId,
  });
  return {...query, posts: query.data?.posts ?? [], meta: query.data?.meta ?? null};
};

export const useCreatePost = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createPost(courseId, body),
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

export const useReportPost = (courseId: string) => {
  return useMutation({
    mutationFn: ({postId, reason}: {postId: string; reason: string}) =>
      reportPost(courseId, postId, reason),
  });
};
