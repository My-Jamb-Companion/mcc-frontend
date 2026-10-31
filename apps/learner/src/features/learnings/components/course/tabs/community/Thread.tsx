"use client";

import {useState} from "react";
import {Button, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {CheckCircle2} from "lucide-react";
import {useAcceptReply, useReplies} from "@/src/features/learnings/hooks/useCommunity";
import {ApiReply, PostResult} from "@/src/features/learnings/services/community.service";
import {MAX_POST_LENGTH, canAccept, canVote, counterText, overLimit, reviewNotice} from "@/src/features/learnings/helper/communityRules";
import {Avatar, RoleBadge, timeAgo} from "./Avatar";
import {EditPost, PostActions} from "./PostActions";
import {VoteButton} from "./VoteButton";

/** Sends a reply (handling the guidelines step); resolves with the server's result or rejects with its error. */
export type SubmitPost = (body: string, parentPostId?: string) => Promise<PostResult>;

/** The answers to one question, and a box to add yours. Opened from the question's card. */
export function Thread({courseId, questionId, questionIsMine, submit}: {courseId: string; questionId: string; questionIsMine: boolean; submit: SubmitPost}) {
  const {replies, isLoading, isError, error} = useReplies(courseId, questionId, true);
  const accept = useAcceptReply(courseId);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const tooLong = overLimit(value.length, MAX_POST_LENGTH);
  const counter = counterText(value.length, MAX_POST_LENGTH);

  const send = async () => {
    if (!value.trim() || tooLong || sending) return;
    setSending(true);
    try {
      const result = await submit(value.trim(), questionId);
      setValue("");
      if (result.status === "held") showSuccess(result.message ?? "Your answer is waiting for a moderator to review it.");
    } catch (e) {
      if (e) showError(extractApiError(e, "Couldn't post that"));
    } finally {
      setSending(false);
    }
  };

  const toggleAccepted = (reply: ApiReply) =>
    accept.mutate(
      {questionId, replyId: reply.is_accepted ? null : reply.post_id},
      {onError: (e) => showError(extractApiError(e, "Couldn't save that"))},
    );

  return (
    <div className="mt-3 rounded-xl border border-muted/20 bg-muted/5 p-3 sm:p-4">
      {isLoading ? (
        <p className="py-2 text-sm text-muted">Loading answers…</p>
      ) : isError ? (
        <p role="alert" className="py-2 text-sm text-muted">{extractApiError(error, "Couldn't load the answers.")}</p>
      ) : replies.length === 0 ? (
        <p className="py-2 text-sm text-muted">No answers yet. Be the first to help.</p>
      ) : (
        <ul className="divide-y divide-muted/20">
          {replies.map((reply) => (
            <ReplyRow key={reply.post_id} reply={reply} courseId={courseId} canAcceptIt={canAccept({is_mine: questionIsMine})} onToggleAccepted={() => toggleAccepted(reply)} />
          ))}
        </ul>
      )}

      <div className="mt-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          maxLength={MAX_POST_LENGTH + 200}
          aria-label="Write an answer"
          placeholder="Write an answer"
          className="w-full rounded-lg border border-muted/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
        />
        <div className="mt-2 flex items-center justify-end gap-3">
          {counter && <span className={`text-xs ${tooLong ? "text-red-600" : "text-muted"}`}>{counter}</span>}
          <Button onClick={send} disabled={!value.trim() || tooLong || sending} width="fit" className="rounded-full px-4 py-1.5 text-sm">
            {sending ? "Sending…" : "Answer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReplyRow({reply, courseId, canAcceptIt, onToggleAccepted}: {reply: ApiReply; courseId: string; canAcceptIt: boolean; onToggleAccepted: () => void}) {
  const [editing, setEditing] = useState(false);
  const name = reply.author.full_name || "A student";
  const notice = reviewNotice(reply);

  return (
    <li className="flex gap-3 py-3">
      <Avatar name={name} src={reply.author.profile_photo_url} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <RoleBadge badge={reply.author.badge} />
          <span className="text-xs text-muted">
            {timeAgo(reply.created_at)}
            {reply.edited ? " · edited" : ""}
          </span>
          {reply.is_accepted && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
              <CheckCircle2 className="w-3 h-3" />
              Accepted answer
            </span>
          )}
        </div>
        {notice && (
          <p role="status" className="mb-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
            {notice}
          </p>
        )}
        {editing ? (
          <EditPost post={reply} courseId={courseId} onDone={() => setEditing(false)} />
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">{reply.body}</p>
        )}
        {!editing && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <VoteButton courseId={courseId} postId={reply.post_id} count={reply.vote_count ?? 0} voted={!!reply.i_voted} disabled={!canVote(reply)} />
            {canAcceptIt && (reply.status ?? "visible") === "visible" && (
              <button type="button" onClick={onToggleAccepted} className="text-xs font-medium text-primary hover:underline">
                {reply.is_accepted ? "Remove accepted answer" : "Accept this answer"}
              </button>
            )}
            <div className="flex-1" />
            <PostActions post={reply} courseId={courseId} onEdit={() => setEditing(true)} />
          </div>
        )}
      </div>
    </li>
  );
}
