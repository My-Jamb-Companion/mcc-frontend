"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@mcc/ui";
import { useReplyToStudent, useStudentThread } from "./useMessages";

const formatWhen = (iso: string) => new Date(iso).toLocaleString();

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
