"use client";

import {useState} from "react";
import {Button, ConfirmModal, Modal, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {Flag, Pencil, Trash2} from "lucide-react";
import {useDeletePost, useReportPost, useUpdatePost} from "@/src/features/learnings/hooks/useCommunity";
import {ApiPost, ApiReply} from "@/src/features/learnings/services/community.service";
import {
  MAX_POST_LENGTH,
  REPORT_REASONS,
  ReportReason,
  canReport,
  counterText,
  overLimit,
  reportReasonLabel,
} from "@/src/features/learnings/helper/communityRules";

type Post = Pick<ApiPost | ApiReply, "post_id" | "body" | "is_mine" | "can_edit" | "status">;

/** Edit (first 15 minutes) and Delete on your own post or answer; Report on someone else's. */
export function PostActions({post, courseId, onEdit}: {post: Post; courseId: string; onEdit: () => void}) {
  return (
    <>
      {post.is_mine && post.can_edit && (
        <button type="button" onClick={onEdit} className="flex items-center gap-1.5 text-subtle hover:text-foreground transition-colors">
          <Pencil className="w-4 h-4" />
          <span>Edit</span>
        </button>
      )}
      {post.is_mine && <DeleteButton postId={post.post_id} courseId={courseId} />}
      {canReport(post) && <ReportButton postId={post.post_id} courseId={courseId} />}
    </>
  );
}

export function EditPost({post, courseId, onDone}: {post: Post; courseId: string; onDone: () => void}) {
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
        // e.g. 409 once the 15 minutes are up, 422 if the edit adds a phone number or a link, 403 if muted.
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
                <input type="radio" name={`report-reason-${postId}`} value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
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
