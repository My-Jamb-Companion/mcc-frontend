"use client";

import {useState} from "react";
import {useAssignmentThread, usePostAssignmentMessage} from "./useAssignmentThread";
import type {ApiAssignmentMessage} from "./assignmentMessages.service";

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {day: "2-digit", month: "short", hour: "numeric", minute: "2-digit"});

function Bubble({message, mine, otherLabel}: {message: ApiAssignmentMessage; mine: boolean; otherLabel: string}) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${mine ? "bg-primary text-white" : "bg-muted/10 text-foreground"}`}>
        <p className={`mb-0.5 text-[11px] font-medium ${mine ? "text-white/80" : "text-muted"}`}>
          {mine ? "You" : otherLabel} · {formatWhen(message.created_at)}
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
      </div>
    </div>
  );
}

/**
 * The private thread between a student and the course coordinator matched to their onboarding.
 * Used by the student (self = "student") and by the coordinator (self = "cra").
 */
export function AssignmentThread({
  assignmentId,
  self,
  otherLabel,
}: {
  assignmentId: string;
  self: "student" | "cra";
  otherLabel: string;
}) {
  const {messages, isPending, isError} = useAssignmentThread(assignmentId);
  const send = usePostAssignmentMessage(assignmentId);
  const [text, setText] = useState("");

  const handleSend = () => {
    const body = text.trim();
    if (!body || send.isPending) return;
    send.mutate(body, {onSuccess: () => setText("")});
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-96 min-h-24 flex-col gap-3 overflow-y-auto" aria-live="polite">
        {isPending && !isError ? (
          <p className="py-6 text-center text-sm text-muted">Loading…</p>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-red-500">The messages couldn&apos;t be loaded.</p>
        ) : messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No messages yet. Say hello below.</p>
        ) : (
          messages.map((m) => (
            <Bubble key={m.message_id} message={m} mine={m.sender_role === self} otherLabel={otherLabel} />
          ))
        )}
      </div>

      <div className="rounded-xl border border-muted/30 bg-background px-4 py-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
          }}
          placeholder="Write a message…"
          aria-label="Message"
          rows={3}
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted"
        />
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || send.isPending}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {send.isPending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
