"use client";

import {useState} from "react";
import {Check, ChevronDown, Reply} from "lucide-react";
import {formatDuration} from "../../../hooks/useLesson";
// import Image from "next/image";

interface InstructorReply {
  id: string;
  body: string;
}

interface InstructorQuestion {
  id: string;
  label: string;
  body: string;
  status: "delivered" | "seen" | "replied";
  timestamp?: number;
  reply?: InstructorReply;
}

interface FacilitatorProps {
  instructorName?: string;
  courseDescription?: string;
  instructorAvatar?: string;
  questions?: InstructorQuestion[];
  onAsk?: (body: string) => void;
  onReply?: (questionId: string, body: string) => void;
  onTimestampClick?: (ts: number) => void;
  currentTime?: number;
}

export default function FacilitatorTab({
  instructorName,
  courseDescription,
  instructorAvatar,
  questions: initialQuestions = DEFAULT_QUESTIONS,
  onAsk,
  onReply,
  onTimestampClick,
  currentTime,
}: FacilitatorProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [newQuestion, setNewQuestion] = useState("");

  const handleAsk = () => {
    if (!newQuestion.trim()) return;
    const q: InstructorQuestion = {
      id: crypto.randomUUID(),
      label: `Q${questions.length + 1}`,
      body: newQuestion.trim(),
      status: "delivered",
      timestamp: currentTime,
    };
    setQuestions((prev) => [q, ...prev]);
    onAsk?.(newQuestion.trim());
    setNewQuestion("");
  };

  const handleReply = (questionId: string, body: string) => {
    onReply?.(questionId, body);
  };

  return (
    <section className="w-full md:max-w-[75%] font-sans">
      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-900 mb-1">
        Ask your instructor.
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-5">
        {courseDescription}
      </p>

      {/* Compose box */}
      <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm mb-2">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder={`What do you want to ask ${instructorName}?`}
          rows={3}
          className="w-full text-sm text-gray-700 resize-none outline-none placeholder:text-gray-400 leading-relaxed"
        />
        <div className="flex justify-end mt-1">
          <button
            onClick={handleAsk}
            disabled={!newQuestion.trim()}
            className="px-5 py-2 text-sm font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Ask {instructorName}
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 mb-6">
        Use <span className="font-bold text-blue-500">&quot;@&quot;</span> to
        highlight the timeline of the course you want to talk about.
      </p>

      {/* Questions */}
      <div>
        {questions.map((q) => (
          <QuestionItem
            key={q.id}
            question={q}
            instructorName={instructorName || ""}
            instructorAvatar={instructorAvatar}
            onReply={handleReply}
            onTimestampClick={onTimestampClick}
          />
        ))}
      </div>
    </section>
  );
}

function TimestampBadge({time, onClick}: {time: number; onClick?: () => void}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center px-2.5 py-0.5 rounded-full border border-violet-300 text-violet-600 text-xs font-semibold hover:bg-violet-50 bg-violet-100 transition-colors"
    >
      <p className="translate-y-px">{formatDuration(time)}</p>
    </button>
  );
}

function StatusBadge({status}: {status: InstructorQuestion["status"]}) {
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
  return null;
}

function QuestionItem({
  question,
  instructorName,
  instructorAvatar,
  onReply,
  onTimestampClick,
}: {
  question: InstructorQuestion;
  instructorName: string;
  instructorAvatar?: string;
  onReply?: (id: string, body: string) => void;
  onTimestampClick?: (ts: number) => void;
}) {
  const [expanded, setExpanded] = useState(!!question.reply);
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply?.(question.id, replyText.trim());
    setReplyText("");
    setShowReplyBox(false);
  };

  return (
    <div className="py-6 border-b border-gray-100 last:border-none">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-gray-900">{question.label}</h3>
        {question.timestamp && (
          <TimestampBadge
            time={question.timestamp}
            onClick={() => onTimestampClick?.(question.timestamp!)}
          />
        )}
      </div>

      {/* Body */}
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        {question.body}
      </p>

      {/* Status row */}
      <div className="flex items-center gap-3 flex-wrap">
        {question.reply && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
          >
            See response
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
        <StatusBadge status={question.status} />
      </div>

      {/* Expanded reply */}
      {expanded && question.reply && (
        <div className="mt-4 ml-3 border-l-2 border-gray-100 pl-4">
          {/* Instructor avatar + message */}
          <div className="flex gap-3 mb-3">
            <div className="relative w-9 h-9 rounded-full bg-gray-200 shrink-0 overflow-hidden">
              {instructorAvatar ? (
                // <Image
                <img
                  src={instructorAvatar}
                  alt={instructorName}
                  className="w-full h-full object-cover"
                  // fill
                  // priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500">
                  {instructorName.slice(0, 1)}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {question.reply.body}
              </p>
              <button
                onClick={() => setShowReplyBox((s) => !s)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                Reply
              </button>
            </div>
          </div>

          {/* Reply input */}
          {showReplyBox && (
            <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm max-w-sm">
              <textarea
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply ${instructorName}`}
                rows={2}
                className="w-full text-sm text-gray-700 resize-none outline-none placeholder:text-gray-400 leading-relaxed"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-1.5 text-sm font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Hint */}
          {showReplyBox && (
            <p className="mt-2 text-xs text-gray-400">
              Use{" "}
              <span className="font-semibold text-blue-500">&quot;@&quot;</span>{" "}
              to highlight the timeline of the course you want to talk about.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const DEFAULT_QUESTIONS: InstructorQuestion[] = [
  {
    id: "q2",
    label: "Q2",
    body: "Realise your dreams and train to be a Classical Mat Pilates instructor with this accredited Teacher Training course",
    status: "delivered",
  },
  {
    id: "q1",
    label: "Q1",
    body: "Realise your dreams and train to be a Classical Mat Pilates instructor with this accredited Teacher Training course",
    status: "seen",
    timestamp: 14,
    reply: {
      id: "r1",
      body: "Realise your dreams and train to be a Classical Mat Pilates instructor with this accredited Teacher Training course",
    },
  },
];
