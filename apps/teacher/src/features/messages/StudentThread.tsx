"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Icon } from "@mcc/ui";
import { useReplyToStudent, useReportMessage, useStudentThread } from "./useMessages";
import type { ThreadMessage } from "./messages.service";

const formatWhen = (iso: string) => new Date(iso).toLocaleString();

const ReportMessageAction = ({
  courseId,
  message,
}: {
  courseId: string;
  message: ThreadMessage;
}) => {
  const reportMutation = useReportMessage(courseId);
  const [reason, setReason] = useState<string | null>(null);

  if (reportMutation.isSuccess) {
    return <span className="text-xs text-muted mt-1 block">Reported</span>;
  }

  if (reason === null) {
    return (
      <button
        type="button"
        onClick={() => setReason("")}
        className="flex items-center gap-1 text-xs text-muted hover:text-danger mt-1"
      >
        <Icon icon="ph:flag" size={13} />
        Report
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why are you reporting this message?"
        rows={2}
        className="w-full resize-none rounded-md border border-muted/20 p-2 text-xs text-foreground outline-none focus:ring-2 ring-primary/30"
      />
      <div className="flex gap-2">
        <Button
          size="xs"
          loading={reportMutation.isPending}
          disabled={!reason.trim()}
          onClick={() =>
            reportMutation.mutate({ messageId: message.message_id, reason: reason.trim() })
          }
        >
          Submit report
        </Button>
        <Button size="xs" variant="ghost" onClick={() => setReason(null)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export const StudentThread = () => {
  const { courseId, studentId } = useParams<{ courseId: string; studentId: string }>();
  const { data: messages, isLoading, isError } = useStudentThread(courseId, studentId);
  const replyMutation = useReplyToStudent(courseId, studentId);
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!body.trim()) return;
    replyMutation.mutate(body.trim(), { onSuccess: () => setBody("") });
  };

  return (
    <div className="flex flex-col h-full">
      <Link href={`/messages/${courseId}`} className="text-sm text-muted hover:text-primary">
        ← Back to threads
      </Link>

      <div className="flex-1 overflow-y-auto my-4 space-y-3">
        {isLoading && <p className="text-sm text-muted">Loading thread…</p>}
        {isError && <p className="text-sm text-danger">Couldn&apos;t load this thread.</p>}
        {messages?.map((message) => (
          <div
            key={message.message_id}
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
              message.sender_role === "instructor"
                ? "ml-auto bg-primary text-white"
                : "bg-muted/10"
            }`}
          >
            <p>{message.body}</p>
            <p
              className={`text-xs mt-1 ${
                message.sender_role === "instructor" ? "text-white/70" : "text-muted"
              }`}
            >
              {formatWhen(message.created_at)}
            </p>
            {message.sender_role === "student" && (
              <ReportMessageAction courseId={courseId} message={message} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2 border-t border-muted/20 pt-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply…"
          rows={2}
          className="flex-1 resize-none rounded-md border border-muted/20 p-2 text-sm outline-none focus:ring-2 ring-primary/30"
        />
        <Button onClick={handleSend} loading={replyMutation.isPending} disabled={!body.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
};
