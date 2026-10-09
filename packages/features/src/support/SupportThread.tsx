"use client";

import {useEffect, useRef, useState} from "react";
import {useSendSupportMessage, useSupportThread} from "./useSupport";
import type {ApiSupportMessage} from "./support.service";

const MAX_LENGTH = 4000;

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {day: "2-digit", month: "short", hour: "numeric", minute: "2-digit"});

function Bubble({message}: {message: ApiSupportMessage}) {
  const mine = message.direction === "inbound";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${mine ? "bg-primary text-white" : "bg-muted/10 text-foreground"}`}>
        <p className={`mb-0.5 text-[11px] font-medium ${mine ? "text-white/80" : "text-muted"}`}>
          {mine ? "You" : message.sender_name || "MCC team"} · {formatWhen(message.created_at)}
        </p>
        {!mine && message.subject && <p className="mb-1 text-sm font-semibold">{message.subject}</p>}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body}</p>
      </div>
    </div>
  );
}

/**
 * The conversation between a student or teacher and the MCC team: what the team has sent, and a box to
 * write back. Messages are plain text.
 */
export function SupportThread() {
  const {messages, isPending, isError, refetch} = useSupportThread();
  const send = useSendSupportMessage();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  // Show the newest message when the conversation opens or grows.
  useEffect(() => {
    end.current?.scrollIntoView?.({block: "nearest"});
  }, [messages.length]);

  const handleSend = () => {
    const body = text.trim();
    if (!body || send.isPending) return;
    send.mutate(body, {onSuccess: () => setText("")});
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-[28rem] min-h-32 flex-col gap-3 overflow-y-auto" aria-live="polite">
        {isPending && !isError ? (
          <p className="py-8 text-center text-sm text-muted">Loading…</p>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-red-500">
            The messages couldn&apos;t be loaded.{" "}
            <button type="button" onClick={() => void refetch()} className="font-semibold underline">Try again</button>
          </p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No messages yet. Write to the MCC team below and they&apos;ll reply here.
          </p>
        ) : (
          messages.map((m) => <Bubble key={m.message_id} message={m} />)
        )}
        <div ref={end} />
      </div>

      <div className="rounded-xl border border-muted/30 bg-background px-4 py-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
          }}
          placeholder="Write to the MCC team…"
          aria-label="Message to the MCC team"
          rows={3}
          className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted"
        />
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{text.length > MAX_LENGTH - 200 ? `${MAX_LENGTH - text.length} characters left` : ""}</span>
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
