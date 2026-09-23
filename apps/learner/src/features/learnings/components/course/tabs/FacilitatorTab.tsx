"use client";

import {useState} from "react";
import {Check} from "lucide-react";
import {formatDuration} from "@/src/features/learnings/hooks/useLesson";
import {
  useInstructorThread,
  useSendInstructorMessage,
} from "@/src/features/learnings/hooks/useInstructorQa";
import {ApiInstructorMessage} from "@/src/features/learnings/services/instructorQa.service";

interface FacilitatorTabProps {
  courseId: string;
  currentTime?: number;
  onTimestampClick?: (seconds: number) => void;
}

/**
 * The real Q&A thread (course_instructor_messages) is one flat, chronological
 * conversation per student -- not the old demo's separate numbered
 * "Q1"/"Q2" cards each with a single nested reply. Renders as message
 * bubbles instead.
 */
export default function FacilitatorTab({courseId, currentTime, onTimestampClick}: FacilitatorTabProps) {
  const {messages, isLoading} = useInstructorThread(courseId);
  const send = useSendInstructorMessage(courseId);
  const [text, setText] = useState("");

  const handleAsk = () => {
    if (!text.trim() || send.isPending) return;
    send.mutate(
      {
        body: text.trim(),
        timestampSeconds: currentTime !== undefined ? Math.floor(currentTime) : undefined,
      },
      {onSuccess: () => setText("")},
    );
  };

  return (
    <section className="w-full md:max-w-[75%] font-sans">
      <h2 className="text-3xl font-bold text-gray-900 mb-1">Ask your instructor.</h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-5">
        Questions here go straight to whoever teaches this course.
      </p>

      <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What do you want to ask?"
          rows={3}
          className="w-full text-sm text-gray-700 resize-none outline-none placeholder:text-gray-400 leading-relaxed"
        />
        <div className="flex justify-end mt-1">
          <button
            onClick={handleAsk}
            disabled={!text.trim() || send.isPending}
            className="px-5 py-2 text-sm font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {send.isPending ? "Sending…" : "Ask"}
          </button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No questions yet -- ask the first one above.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.message_id}
              message={message}
              onTimestampClick={onTimestampClick}
            />
          ))
        )}
      </div>
    </section>
  );
}

function StatusBadge({status}: {status: ApiInstructorMessage["status"]}) {
  if (status === "delivered") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-500 font-medium">
        Delivered <Check className="w-3.5 h-3.5" />
      </span>
    );
  }
  if (status === "seen") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-500 font-medium">
        Seen <Check className="w-3.5 h-3.5" />
      </span>
    );
  }
  if (status === "replied") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-violet-500 font-medium">
        Replied <Check className="w-3.5 h-3.5" />
      </span>
    );
  }
  return null;
}

function MessageBubble({
  message,
  onTimestampClick,
}: {
  message: ApiInstructorMessage;
  onTimestampClick?: (seconds: number) => void;
}) {
  const isStudent = message.sender_role === "student";
  return (
    <div
      className={`py-4 border-b border-gray-100 last:border-none ${
        isStudent ? "" : "bg-violet-50/50 rounded-xl px-3"
      }`}
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-sm font-semibold text-gray-900">
          {isStudent ? "You" : "Instructor"}
        </span>
        {message.timestamp_seconds != null && (
          <button
            onClick={() => onTimestampClick?.(message.timestamp_seconds!)}
            className="flex items-center justify-center px-2.5 py-0.5 rounded-full border border-violet-300 text-violet-600 text-xs font-semibold hover:bg-violet-50 bg-violet-100 transition-colors"
          >
            {formatDuration(message.timestamp_seconds)}
          </button>
        )}
        {isStudent && <StatusBadge status={message.status} />}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{message.body}</p>
    </div>
  );
}
