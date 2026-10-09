"use client";

import {Icon, showError} from "@mcc/ui";
import {useEffect, useRef, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {extractApiError} from "@mcc/api";
import {sendMessage} from "../services/messages.service";
import type {ApiThreadMessage} from "../services/conversations.service";
import {CONVERSATIONS_KEY, useConversation} from "../hooks/useConversations";
import {displayName, MAX_REPLY_LENGTH, messageTime} from "../helper/messaging";

function Bubble({message}: {message: ApiThreadMessage}) {
  const fromTeam = message.direction === "outbound";
  return (
    <div className={`flex ${fromTeam ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${fromTeam ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"}`}>
        <p className={`mb-0.5 text-[11px] font-medium ${fromTeam ? "text-white/70" : "text-neutral-500"}`}>
          {fromTeam ? message.sender_name || "MCC team" : "Reply"} · {messageTime(message.created_at)}
        </p>
        {message.subject && <p className="mb-1 text-sm font-semibold">{message.subject}</p>}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body}</p>
        {fromTeam && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-white/60">
            {message.read ? <><Icon icon="lucide:check-check" size={12} /> Read</> : message.delivered ? "Emailed, not read yet" : "In the app, not read yet (the email did not go out)"}
          </p>
        )}
      </div>
    </div>
  );
}

/** One conversation: everything said, oldest first, and a box to reply. */
export default function ConversationThread({userId, onBack}: {userId: string; onBack?: () => void}) {
  const queryClient = useQueryClient();
  const {data, isPending, isError, refetch} = useConversation(userId);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  // A different conversation starts with an empty reply box.
  useEffect(() => setText(""), [userId]);
  useEffect(() => {
    end.current?.scrollIntoView?.({block: "nearest"});
  }, [data?.messages.length, userId]);

  const reply = useMutation({
    mutationFn: (body: string) => sendMessage({recipient_id: userId, body}),
    onSuccess: () => {
      setText("");
      void queryClient.invalidateQueries({queryKey: ["admin-messages", "thread", userId]});
      void queryClient.invalidateQueries({queryKey: CONVERSATIONS_KEY});
    },
    onError: (error) => showError(extractApiError(error, "Failed to send the reply. Please try again.")),
  });

  const send = () => {
    const body = text.trim();
    if (body && !reply.isPending) reply.mutate(body);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Back to the inbox" className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden">
            <Icon icon="lucide:arrow-left" size={18} />
          </button>
        )}
        {data ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">{displayName(data.user)}</p>
            <p className="truncate text-xs text-neutral-500">{data.user.email} · {data.user.role}</p>
          </div>
        ) : (
          <div className="h-8 w-40 animate-pulse rounded bg-neutral-100" />
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {isPending && !isError && <p className="py-10 text-center text-sm text-neutral-400">Loading…</p>}
        {isError && (
          <p className="py-10 text-center text-sm text-red-500">
            This conversation couldn&apos;t be loaded.{" "}
            <button type="button" onClick={() => void refetch()} className="font-semibold underline">Try again</button>
          </p>
        )}
        {data?.messages.map((m) => <Bubble key={m.message_id} message={m} />)}
        <div ref={end} />
      </div>

      <div className="border-t border-neutral-100 px-4 py-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_REPLY_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
          aria-label="Reply"
          placeholder="Write a reply… (Ctrl or ⌘ + Enter to send)"
          rows={3}
          disabled={isError}
          className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 disabled:bg-neutral-50"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={send}
            disabled={!text.trim() || reply.isPending || isError}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {reply.isPending ? "Sending…" : "Send reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
