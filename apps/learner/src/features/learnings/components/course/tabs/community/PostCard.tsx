"use client";

import {useState} from "react";
import {CheckCircle2, MessageSquare, Pin} from "lucide-react";
import {ApiPost} from "@/src/features/learnings/services/community.service";
import {answersLabel, canVote, reviewNotice} from "@/src/features/learnings/helper/communityRules";
import {Avatar, RoleBadge, timeAgo} from "./Avatar";
import {EditPost, PostActions} from "./PostActions";
import {SubmitPost, Thread} from "./Thread";
import {VoteButton} from "./VoteButton";

/** One question: who asked, the question, votes, whether it's answered, and its answers when opened. */
export function PostCard({post, courseId, submit}: {post: ApiPost; courseId: string; submit: SubmitPost}) {
  const name = post.author.full_name || "A student";
  const notice = reviewNotice(post);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const visible = (post.status ?? "visible") === "visible";

  return (
    <div className="flex gap-3 py-5 border-b border-muted/20 last:border-none">
      <Avatar name={name} src={post.author.profile_photo_url} />

      <div className="flex-1 min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground text-sm">{name}</span>
          <RoleBadge badge={post.author.badge} />
          <span className="text-xs text-muted">
            {timeAgo(post.created_at)}
            {post.edited ? " · edited" : ""}
          </span>
          {post.pinned && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              <Pin className="w-3 h-3" />
              Pinned
            </span>
          )}
          {post.answered && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
              <CheckCircle2 className="w-3 h-3" />
              Answered
            </span>
          )}
        </div>

        {notice && (
          <p role="status" className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {notice}
          </p>
        )}

        {editing ? (
          <EditPost post={post} courseId={courseId} onDone={() => setEditing(false)} />
        ) : (
          <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap break-words">{post.body}</p>
        )}

        {!editing && (
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <VoteButton courseId={courseId} postId={post.post_id} count={post.vote_count ?? 0} voted={!!post.i_voted} disabled={!canVote(post)} />
            {visible && (
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <MessageSquare className="w-4 h-4" />
                {answersLabel(post.reply_count)}
              </button>
            )}
            <div className="flex-1" />
            <PostActions post={post} courseId={courseId} onEdit={() => setEditing(true)} />
          </div>
        )}

        {open && visible && <Thread courseId={courseId} questionId={post.post_id} questionIsMine={!!post.is_mine} submit={submit} />}
      </div>
    </div>
  );
}
