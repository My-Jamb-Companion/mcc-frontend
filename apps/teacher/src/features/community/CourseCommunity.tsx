"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, ConfirmModal, Icon } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { FEED_MODES, answersLabel, canPinMore, removeWarning } from "./community.helpers";
import type { CommunityPost, CommunityReply, FeedMode } from "./community.service";
import { useAccept, useAnswer, usePin, usePosts, useRemovePost, useReplies } from "./useCommunity";

const formatWhen = (iso: string) => new Date(iso).toLocaleString();

const Chip = ({ children, tone }: { children: React.ReactNode; tone: "amber" | "green" | "primary" }) => {
  const style = {
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-700",
    primary: "bg-primary/10 text-primary",
  }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style}`}>{children}</span>;
};

/**
 * One course's discussion, from the teacher's side: answer questions, accept the answer that helped, pin the notes
 * everyone should read, and remove posts that don't belong. Everything posted is already checked by the server
 * (phone numbers and links refused, exam-leak talk and abuse held for a moderator).
 */
export const CourseCommunity = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [mode, setMode] = useState<FeedMode>("new");
  const { data: posts, isLoading, isError, error } = usePosts(courseId, mode);
  const [pinHint, setPinHint] = useState<string | null>(null);
  const pin = usePin(courseId);

  const togglePin = (post: CommunityPost) => {
    if (!post.pinned && posts && !canPinMore(posts)) {
      setPinHint("Three questions are already pinned. Unpin one first.");
      return;
    }
    setPinHint(null);
    pin.mutate({ postId: post.post_id, pinned: !post.pinned });
  };

  return (
    <div>
      <Link href="/community" className="text-sm text-muted hover:text-primary">
        ← All courses
      </Link>
      <h1 className="mt-2 mb-1 text-xl font-semibold">Course discussion</h1>
      <p className="mb-4 text-sm text-muted">Questions from your students. Answer them, accept the answer that helped, and remove anything that doesn&apos;t belong.</p>

      <div role="tablist" aria-label="Sort questions" className="mb-4 inline-flex items-center rounded-lg bg-muted/10 p-1">
        {FEED_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={mode === m.value}
            onClick={() => setMode(m.value)}
            className={`rounded-md px-3 py-1 text-sm font-medium ${mode === m.value ? "bg-background shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {pinHint && <p role="status" className="mb-3 text-sm text-danger">{pinHint}</p>}

      {isLoading && <p className="text-sm text-muted">Loading the discussion…</p>}
      {isError && <p role="alert" className="text-sm text-danger">{extractApiError(error, "Couldn't load the discussion.")}</p>}
      {posts && posts.length === 0 && (
        <p className="text-sm text-muted">{mode === "unanswered" ? "Every question has an answer." : "No questions yet."}</p>
      )}

      <ul className="space-y-3">
        {posts?.map((post) => (
          <QuestionCard key={post.post_id} post={post} courseId={courseId} onTogglePin={() => togglePin(post)} />
        ))}
      </ul>
    </div>
  );
};

const QuestionCard = ({ post, courseId, onTogglePin }: { post: CommunityPost; courseId: string; onTogglePin: () => void }) => {
  const [open, setOpen] = useState(false);
  const remove = useRemovePost(courseId);
  const name = post.author.full_name || "A student";
  return (
    <li className="rounded-lg border border-muted/20 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{name}</span>
        {post.author.badge && <Chip tone="primary">{post.author.badge}</Chip>}
        <span className="text-xs text-muted">{formatWhen(post.created_at)}</span>
        {post.pinned && <Chip tone="amber">Pinned</Chip>}
        {post.answered && <Chip tone="green">Answered</Chip>}
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm">{post.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-xs text-muted">{post.vote_count ?? 0} {(post.vote_count ?? 0) === 1 ? "vote" : "votes"}</span>
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-primary hover:underline">
          {answersLabel(post.reply_count)}
        </button>
        <div className="flex-1" />
        <button type="button" onClick={onTogglePin} className="flex items-center gap-1 text-xs text-muted hover:text-primary">
          <Icon icon="ph:push-pin" size={14} />
          {post.pinned ? "Unpin" : "Pin"}
        </button>
        <RemoveButton name={name} onConfirm={() => remove.mutate(post.post_id)} />
      </div>
      {open && <Answers courseId={courseId} question={post} />}
    </li>
  );
};

const RemoveButton = ({ name, onConfirm }: { name: string; onConfirm: () => void }) => (
  <ConfirmModal
    title="Remove this post?"
    description={removeWarning(name)}
    confirmText="Remove"
    variant="danger"
    onConfirm={onConfirm}
    trigger={
      <button type="button" className="flex items-center gap-1 text-xs text-muted hover:text-danger">
        <Icon icon="ph:trash" size={14} />
        Remove
      </button>
    }
  />
);

const Answers = ({ courseId, question }: { courseId: string; question: CommunityPost }) => {
  const { data: replies, isLoading, isError } = useReplies(courseId, question.post_id, true);
  const answer = useAnswer(courseId);
  const accept = useAccept(courseId);
  const remove = useRemovePost(courseId);
  const [body, setBody] = useState("");

  const send = () => {
    if (!body.trim()) return;
    answer.mutate({ body: body.trim(), questionId: question.post_id }, { onSuccess: () => setBody("") });
  };

  return (
    <div className="mt-3 rounded-lg bg-muted/5 p-3">
      {isLoading && <p className="text-sm text-muted">Loading answers…</p>}
      {isError && <p className="text-sm text-danger">Couldn&apos;t load the answers.</p>}
      {replies && replies.length === 0 && <p className="text-sm text-muted">Nobody has answered yet.</p>}
      <ul className="divide-y divide-muted/20">
        {replies?.map((reply: CommunityReply) => (
          <li key={reply.post_id} className="py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{reply.author.full_name || "A student"}</span>
              {reply.author.badge && <Chip tone="primary">{reply.author.badge}</Chip>}
              {reply.is_accepted && <Chip tone="green">Accepted answer</Chip>}
              <span className="text-xs text-muted">{formatWhen(reply.created_at)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm">{reply.body}</p>
            <div className="mt-1 flex items-center gap-3 text-xs">
              <span className="text-muted">{reply.vote_count ?? 0} votes</span>
              <button
                type="button"
                onClick={() => accept.mutate({ questionId: question.post_id, replyId: reply.is_accepted ? null : reply.post_id })}
                className="font-medium text-primary hover:underline"
              >
                {reply.is_accepted ? "Remove accepted answer" : "Accept this answer"}
              </button>
              <RemoveButton name={reply.author.full_name || "A student"} onConfirm={() => remove.mutate(reply.post_id)} />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={2000}
          aria-label="Answer as the teacher"
          placeholder="Answer as the teacher"
          className="w-full resize-none rounded-md border border-muted/20 p-2 text-sm text-foreground outline-none focus:ring-2 ring-primary/30"
        />
        <div className="mt-2 flex justify-end">
          <Button size="xs" loading={answer.isPending} disabled={!body.trim()} onClick={send}>
            Answer
          </Button>
        </div>
      </div>
    </div>
  );
};
