"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {Button, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useCommunityPosts, useCreatePost} from "@/src/features/learnings/hooks/useCommunity";
import {FeedMode, PostResult} from "@/src/features/learnings/services/community.service";
import {
  COMMUNITY_GUIDELINES,
  FEED_MODES,
  MAX_POST_LENGTH,
  counterText,
  errorCode,
  overLimit,
} from "@/src/features/learnings/helper/communityRules";
import {GuidelinesModal} from "./community/GuidelinesModal";
import {PostCard} from "./community/PostCard";

/**
 * The course's question-and-answer board. Questions are posted here, answered in a thread under each one, voted up,
 * and the person who asked (or the teacher) accepts the answer that helped. The teacher's pinned notes stay on top.
 * The server checks everything that is posted (see backend/app/features/academics/community), so this screen only has
 * to show what it says: refusals with their message, a held post as "waiting for review", the guidelines before a
 * student's first post.
 */
export default function CommunityTab({courseId}: {courseId: string}) {
  const [mode, setMode] = useState<FeedMode>("new");
  const {posts, isLoading, isError, error} = useCommunityPosts(courseId, mode);
  const createPost = useCreatePost(courseId);
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // The guidelines step: a post (or answer) the server refused for want of them waits here, is sent again once the
  // person agrees, and is dropped if they say "not now".
  const [asking, setAsking] = useState(false);
  const resolver = useRef<{agree: () => void; cancel: () => void} | null>(null);
  const askGuidelines = () =>
    new Promise<void>((resolve, reject) => {
      resolver.current = {agree: resolve, cancel: () => reject(null)};
      setAsking(true);
    });

  const submit = useCallback(
    async (body: string, parentPostId?: string): Promise<PostResult> => {
      try {
        return await createPost.mutateAsync({body, parentPostId});
      } catch (e) {
        if (errorCode(e) !== "GUIDELINES_REQUIRED") throw e;
        await askGuidelines();
        return await createPost.mutateAsync({body, parentPostId});
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [createPost.mutateAsync],
  );

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const tooLong = overLimit(value.length, MAX_POST_LENGTH);
  const counter = counterText(value.length, MAX_POST_LENGTH);

  const handlePost = async () => {
    if (!value.trim() || tooLong || createPost.isPending) return;
    try {
      const result = await submit(value.trim());
      setValue("");
      // A post the automatic check held is not in the feed yet: say so, so it doesn't look lost.
      if (result.status === "held") showSuccess(result.message ?? "Your post is waiting for a moderator to review it.");
    } catch (e) {
      // 422 (phone numbers, links), 429 (too many posts), 403 (muted, not enrolled) come back with a message
      // written for the learner. `null` is the person saying "not now" to the guidelines.
      if (e) showError(extractApiError(e, "Couldn't post that"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
  };

  return (
    <section className="mx-auto w-full md:w-[75%]">
      <p className="mb-3 rounded-xl bg-muted/10 px-4 py-3 text-xs leading-relaxed text-muted">{COMMUNITY_GUIDELINES}</p>
      <div className="w-full rounded-2xl border border-muted/20 bg-background px-4 pt-3 pb-3 shadow-sm">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question, share useful insights and conversations about this course"
          rows={3}
          aria-label="Write a post"
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted outline-none leading-relaxed"
        />
        <div className="flex items-center justify-end gap-3 pt-1">
          {counter && (
            <span className={`text-xs ${tooLong ? "text-red-600" : "text-muted"}`} aria-live="polite">
              {counter}
            </span>
          )}
          <Button
            onClick={handlePost}
            disabled={!value.trim() || tooLong || createPost.isPending}
            width="fit"
            className="rounded-full bg-blue-500! px-5 py-2 text-sm font-medium text-white transition-opacity hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {createPost.isPending ? "Posting…" : "Post"}
          </Button>
        </div>
      </div>

      <div role="tablist" aria-label="Sort questions" className="mt-6 inline-flex items-center rounded-xl bg-muted/10 p-1">
        {FEED_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => setMode(m.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              mode === m.value ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="w-full pb-8">
        {isLoading ? (
          <p className="text-sm text-muted py-8 text-center">Loading discussion…</p>
        ) : isError ? (
          // 403 NOT_ENROLLED lands here: the backend's message says what to do.
          <p role="alert" className="text-sm text-muted py-8 text-center">
            {extractApiError(error, "Couldn't load the discussion. Please try again.")}
          </p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">
            {mode === "unanswered" ? "Every question has an answer. Nice." : "No questions yet. Ask the first one!"}
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.post_id} post={post} courseId={courseId} submit={submit} />)
        )}
      </div>

      <GuidelinesModal
        open={asking}
        onAgree={() => {
          setAsking(false);
          resolver.current?.agree();
        }}
        onCancel={() => {
          setAsking(false);
          resolver.current?.cancel();
        }}
      />
    </section>
  );
}
