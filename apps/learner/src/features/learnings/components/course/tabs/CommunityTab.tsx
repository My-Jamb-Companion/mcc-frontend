"use client";

import {useRef, useState, useEffect} from "react";
import {Button, ConfirmModal, Modal, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {Flag, Pencil, Trash2} from "lucide-react";
import {
  useCommunityPosts,
  useCreatePost,
  useDeletePost,
  useReportPost,
  useUpdatePost,
} from "@/src/features/learnings/hooks/useCommunity";
import {ApiPost} from "@/src/features/learnings/services/community.service";
import {
  COMMUNITY_GUIDELINES,
  MAX_POST_LENGTH,
  REPORT_REASONS,
  ReportReason,
  canReport,
  counterText,
  overLimit,
  reportReasonLabel,
  reviewNotice,
} from "@/src/features/learnings/helper/communityRules";

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/**
 * Real course discussion board (course_posts). The backend only exposes
 * top-level posts with a reply_count -- there's no thread-fetch endpoint
 * yet, so replies can't be listed inline (the old demo UI's upvote/downvote
 * and inline comment thread had no real data behind them either and are
 * gone here).
 */
export default function CommunityTab({courseId}: {courseId: string}) {
  const {posts, isLoading, isError, error} = useCommunityPosts(courseId);
  const createPost = useCreatePost(courseId);
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const tooLong = overLimit(value.length, MAX_POST_LENGTH);
  const counter = counterText(value.length, MAX_POST_LENGTH);

  const handlePost = () => {
    if (!value.trim() || tooLong || createPost.isPending) return;
    createPost.mutate(value.trim(), {
      onSuccess: (result) => {
        setValue("");
        // A post the automatic check held is not in the feed yet: say so, so it doesn't look lost.
        if (result.status === "held") {
          showSuccess(result.message ?? "Your post is waiting for a moderator to review it.");
        }
      },
      // 422 (phone numbers, links), 429 (too many posts) and 403 come back with a message written for the learner.
      onError: (e) => showError(extractApiError(e, "Couldn't post that")),
    });
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
          placeholder="Ask a question about this course"
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

      <div className="w-full py-8">
        {isLoading ? (
          <p className="text-sm text-muted py-8 text-center">Loading discussion…</p>
        ) : isError ? (
          // 403 NOT_ENROLLED lands here: the backend's message says what to do.
          <p role="alert" className="text-sm text-muted py-8 text-center">
            {extractApiError(error, "Couldn't load the discussion. Please try again.")}
          </p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">
            No posts yet. Start the discussion!
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.post_id} post={post} courseId={courseId} />)
        )}
      </div>
    </section>
  );
}

function Avatar({name, src}: {name: string; src?: string | null}) {
  const initials = (name || "?").slice(0, 2).toUpperCase();
  const colors = [
    "bg-violet-200 text-violet-700",
    "bg-sky-200 text-sky-700",
    "bg-emerald-200 text-emerald-700",
    "bg-amber-200 text-amber-700",
    "bg-rose-200 text-rose-700",
  ];
  const color = colors[(name || "?").charCodeAt(0) % colors.length];

  if (src) {
    return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

function PostCard({post, courseId}: {post: ApiPost; courseId: string}) {
  const name = post.author.full_name || "A student";
  const notice = reviewNotice(post);
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex gap-3 py-5 border-b border-muted/20 last:border-none">
      <Avatar name={name} src={post.author.profile_photo_url} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-foreground text-sm">{name}</span>
          <span className="text-xs text-muted">
            {timeAgo(post.created_at)}
            {post.edited ? " · edited" : ""}
          </span>
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
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {post.reply_count > 0 && (
              <span className="text-muted text-xs">
                {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
              </span>
            )}
            <div className="flex-1" />
            {post.is_mine && post.can_edit && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-subtle hover:text-foreground transition-colors"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
            {post.is_mine && <DeleteButton postId={post.post_id} courseId={courseId} />}
            {canReport(post) && <ReportButton postId={post.post_id} courseId={courseId} />}
          </div>
        )}
      </div>
    </div>
  );
}

function EditPost({post, courseId, onDone}: {post: ApiPost; courseId: string; onDone: () => void}) {
  const update = useUpdatePost(courseId);
  const [value, setValue] = useState(post.body);
  const tooLong = overLimit(value.length, MAX_POST_LENGTH);
  const counter = counterText(value.length, MAX_POST_LENGTH);

  const save = () => {
    if (!value.trim() || tooLong || update.isPending) return;
    update.mutate(
      {postId: post.post_id, body: value.trim()},
      {
        onSuccess: (result) => {
          if (result.status === "held") showSuccess(result.message ?? "Your post is waiting for a moderator to review it.");
          onDone();
        },
        // e.g. 409 once the 15 minutes are up, or 422 if the edit adds a phone number or a link.
        onError: (e) => showError(extractApiError(e, "Couldn't save that change")),
      },
    );
  };

  return (
    <div className="mb-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        aria-label="Edit your post"
        className="w-full rounded-lg border border-muted/30 bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
      />
      <div className="mt-2 flex items-center justify-end gap-3">
        {counter && <span className={`text-xs ${tooLong ? "text-red-600" : "text-muted"}`}>{counter}</span>}
        <button type="button" onClick={onDone} className="text-sm text-muted hover:text-foreground">
          Cancel
        </button>
        <Button onClick={save} disabled={!value.trim() || tooLong || update.isPending} width="fit" className="rounded-full px-4 py-1.5 text-sm">
          {update.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function DeleteButton({postId, courseId}: {postId: string; courseId: string}) {
  const remove = useDeletePost(courseId);
  return (
    <ConfirmModal
      title="Delete this post?"
      description="It will be removed from the discussion for everyone. This can't be undone."
      confirmText="Delete"
      variant="danger"
      onConfirm={() =>
        remove.mutate(postId, {
          onSuccess: () => showSuccess("Post deleted"),
          onError: (e) => showError(extractApiError(e, "Couldn't delete that post")),
        })
      }
      trigger={
        <button
          type="button"
          disabled={remove.isPending}
          className="flex items-center gap-1.5 text-subtle hover:text-foreground transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      }
    />
  );
}

function ReportButton({postId, courseId}: {postId: string; courseId: string}) {
  const report = useReportPost(courseId);
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");

  const send = () => {
    if (!reason) return;
    report.mutate(
      {postId, reason: reportReasonLabel(reason)},
      {
        onSuccess: () => {
          setReported(true);
          setOpen(false);
          showSuccess("Thanks. A moderator will take a look.");
        },
        // 409 if they already reported it, 429 if they have reported a lot in the last hour.
        onError: (e) => {
          setOpen(false);
          showError(extractApiError(e, "Couldn't send that report"));
        },
      },
    );
  };

  return (
    <>
      <button
        type="button"
        disabled={reported}
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-subtle hover:text-foreground transition-colors disabled:opacity-40"
      >
        <Flag className="w-4 h-4" />
        <span>{reported ? "Reported" : "Report"}</span>
      </button>
      <Modal open={open} title="Report this post" maxWidth="max-w-sm">
        <div className="space-y-3">
          <p className="text-sm text-muted">What is wrong with it? A moderator will review it.</p>
          <div role="radiogroup" aria-label="Reason" className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-sm text-foreground">
                <input type="radio" name="report-reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
                {r.label}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" width="fit" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" width="fit" disabled={!reason} loading={report.isPending} onClick={send}>
              Send report
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
