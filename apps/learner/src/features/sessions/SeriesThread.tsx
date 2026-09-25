"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Icon} from "@mcc/ui";
import {useSeriesThread, usePostSeriesMessage} from "./hooks/useSeriesMessages";
import {ApiSeriesMessage} from "./services/seriesMessages.service";

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

function MessageBubble({message}: {message: ApiSeriesMessage}) {
  const isStudent = message.sender_role === "student";
  return (
    <div
      className={`py-4 border-b border-gray-100 last:border-none ${
        isStudent ? "" : "bg-violet-50/50 rounded-xl px-3"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-gray-900">
          {isStudent ? "You" : "Your teacher"}
        </span>
        <span className="text-xs text-gray-400">{formatWhen(message.created_at)}</span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{message.body}</p>
    </div>
  );
}

export default function SeriesThread() {
  const {seriesId} = useParams<{seriesId: string}>();
  const router = useRouter();
  const {messages, isLoading} = useSeriesThread(seriesId);
  const send = usePostSeriesMessage(seriesId);
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || send.isPending) return;
    send.mutate(text.trim(), {onSuccess: () => setText("")});
  };

  return (
    <section className="w-full md:max-w-[75%] mx-auto py-6 font-sans">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <Icon icon="mdi:arrow-left" size={16} />
        Back
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">Message your teacher</h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-5">
        This is your private thread with your teacher for your weekly sessions.
      </p>

      <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          rows={3}
          className="w-full text-sm text-gray-700 resize-none outline-none placeholder:text-gray-400 leading-relaxed"
        />
        <div className="flex justify-end mt-1">
          <button
            onClick={handleSend}
            disabled={!text.trim() || send.isPending}
            className="px-5 py-2 text-sm font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {send.isPending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No messages yet -- say hello above.
          </p>
        ) : (
          messages.map((message) => <MessageBubble key={message.message_id} message={message} />)
        )}
      </div>
    </section>
  );
}
