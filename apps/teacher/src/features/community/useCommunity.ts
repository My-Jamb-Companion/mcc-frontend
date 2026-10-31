import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { FeedMode, acceptReply, createPost, getPosts, getReplies, removePost, setPinned } from "./community.service";

const ROOT = (courseId: string) => ["teacher", "community", courseId] as const;

export const usePosts = (courseId: string, mode: FeedMode) =>
  useQuery({ queryKey: [...ROOT(courseId), "feed", mode], queryFn: () => getPosts(courseId, mode) });

export const useReplies = (courseId: string, postId: string, enabled: boolean) =>
  useQuery({ queryKey: [...ROOT(courseId), "replies", postId], queryFn: () => getReplies(courseId, postId), enabled });

/** Runs a change, then refreshes the whole course's community, and says what went wrong in the server's words. */
function useChange<V>(courseId: string, fn: (v: V) => Promise<void>, done: string | null, failed: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOT(courseId) });
      if (done) showSuccess(done);
    },
    onError: (e) => showError(extractApiError(e, failed)),
  });
}

export const useAnswer = (courseId: string) =>
  useChange(courseId, ({ body, questionId }: { body: string; questionId: string }) => createPost(courseId, body, questionId), "Answer posted", "Couldn't post that");

export const useRemovePost = (courseId: string) =>
  useChange(courseId, (postId: string) => removePost(courseId, postId), "Post removed", "Couldn't remove that post");

export const usePin = (courseId: string) =>
  useChange(courseId, ({ postId, pinned }: { postId: string; pinned: boolean }) => setPinned(courseId, postId, pinned), null, "Couldn't change the pin");

export const useAccept = (courseId: string) =>
  useChange(courseId, ({ questionId, replyId }: { questionId: string; replyId: string | null }) => acceptReply(courseId, questionId, replyId), null, "Couldn't save that");
