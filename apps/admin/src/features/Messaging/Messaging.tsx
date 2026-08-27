"use client";

import {Icon} from "@mcc/ui";
import dynamic from "next/dynamic";
import {useEffect, useMemo, useRef, useState} from "react";
import "react-quill-new/dist/quill.snow.css";

interface Participant {
  name: string;
  email: string;
  avatarUrl: string;
}

interface ThreadMessage {
  id: string;
  from: Participant;
  to: string;
  format: "html" | "plain";
  body: string[];
}

interface Thread {
  id: string;
  sender: Participant;
  subject: string;
  preview: string;
  date: string;
  unreadCount?: number;
  timestamp: string;
  relativeTime: string;
  messages: ThreadMessage[];
}

const CURRENT_USER: Participant = {
  name: "Bright",
  email: "bright@gmail.com",
  avatarUrl: "https://i.pravatar.cc/64?img=68",
};

const INITIAL_THREADS: Thread[] = [
  {
    id: "t1",
    sender: {
      name: "Leslie Alexander",
      email: "lesalexand@gmail.com",
      avatarUrl: "https://i.pravatar.cc/64?img=47",
    },
    subject: "PLEASE CHECK IN.",
    preview:
      "Hey, just wanted to give you a heads-up that I'll be there next time. I'm really lookin...",
    date: "Nov 8",
    unreadCount: 2,
    timestamp: "Aug 22, 2026, 12:43 AM",
    relativeTime: "3d ago",
    messages: [
      {
        id: "m1",
        from: {
          name: "Leslie Alexander",
          email: "lesalexand@gmail.com",
          avatarUrl: "https://i.pravatar.cc/64?img=47",
        },
        to: "Me",
        format: "plain",
        body: [
          "Dear Bright",
          "I hope this message finds you well. I wanted to reach out to discuss our upcoming project timeline and ensure we're aligned on the next steps.",
          "Please let me know if you have any questions or need additional information. Looking forward to your feedback.",
          "Thank you for your attention to this matter.",
        ],
      },
      {
        id: "m2",
        from: CURRENT_USER,
        to: "Leslie Alexander",
        format: "plain",
        body: [
          "Dear Leslie",
          "Thanks for reaching out! Everything looks good on my end. Let's touch base tomorrow afternoon to finalize the details.",
        ],
      },
    ],
  },
  {
    id: "t2",
    sender: {
      name: "Leslie Alexander",
      email: "lesalexand@gmail.com",
      avatarUrl: "https://i.pravatar.cc/64?img=47",
    },
    subject: "PROJECT UPDATES",
    preview: "Hey, just wanted to check on the latest designs...",
    date: "Nov 5",
    timestamp: "Aug 19, 2026, 10:15 AM",
    relativeTime: "6d ago",
    messages: [],
  },
];

function ThreadListItem({
  thread,
  active,
  onClick,
}: {
  thread: Thread;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-neutral-100 px-4 py-3 text-left transition-colors ${
        active ? "bg-neutral-50" : "hover:bg-neutral-50"
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={thread.sender.avatarUrl}
          alt={thread.sender.name}
          className="h-9 w-9 rounded-full object-cover"
        />
        {thread.unreadCount ? (
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-violet-600" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {thread.sender.name}
            {thread.unreadCount ? (
              <span className="font-normal text-neutral-400">
                {" "}
                · {thread.unreadCount}
              </span>
            ) : null}
            {" · "}
            <span className="font-normal text-neutral-500">
              {thread.subject}
            </span>
          </p>
          {thread.date && (
            <span className="shrink-0 text-xs text-neutral-400">
              {thread.date}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm text-neutral-500">
          {thread.preview}
        </p>
      </div>
      <Icon
        icon="mdi:archive-outline"
        size={16}
        className="mt-1 shrink-0 text-neutral-300"
      />
    </button>
  );
}

function MessageBody({message}: {message: ThreadMessage}) {
  return (
    <div className="border-b border-neutral-100 pb-5">
      <div className="flex items-center gap-3">
        <img
          src={message.from.avatarUrl}
          alt={message.from.name}
          className="h-8 w-8 rounded-full object-cover"
        />
        <p className="text-sm">
          <span className="font-semibold text-neutral-900">
            {message.from.name}
          </span>{" "}
          <span className="text-neutral-400">&lt;{message.from.email}&gt;</span>
        </p>
      </div>
      <p className="mt-1 pl-11 text-xs text-neutral-400">To: {message.to}</p>
      <div className="mt-3 space-y-3 pl-11 text-sm leading-relaxed text-neutral-700">
        {message.format === "html"
          ? message.body.map((paragraph, i) => (
              <div key={i} dangerouslySetInnerHTML={{__html: paragraph}} />
            ))
          : message.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </div>
    </div>
  );
}

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-32 w-full animate-pulse rounded-md bg-gray-100" />
  ),
});
function ReplyComposer({
  recipientEmail,
  onClose,
  onSend,
}: {
  recipientEmail: string;
  onClose: () => void;
  onSend: (htmlContent: string) => void;
}) {
  const [content, setContent] = useState("");

  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{list: "ordered"}, {list: "bullet"}],
        ["link", "image"],
        ["clean"],
      ],
    }),
    [],
  );

  const handleSend = () => {
    // Strip empty HTML tags from blank Quill state
    const cleanText = content.replace(/<[^>]*>/g, "").trim();
    if (cleanText.length > 0) {
      onSend(content);
      setContent("");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 text-sm text-neutral-600 bg-neutral-50/50">
        <span>To: {recipientEmail}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reply"
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <Icon icon="mdi:close" size={16} />
        </button>
      </div>

      <div className="quill-composer-wrapper">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          placeholder="Write reply here..."
          className="border-none"
        />
      </div>

      <div className="flex items-center justify-end border-t border-neutral-200 px-4 py-2.5 bg-white">
        <button
          type="button"
          onClick={handleSend}
          className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          Send
        </button>
      </div>

      <style jsx global>{`
        .quill-composer-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e5e5;
          padding: 8px 16px;
        }
        .quill-composer-wrapper .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 0.875rem;
          min-height: 120px;
        }
        .quill-composer-wrapper .ql-editor {
          min-height: 120px;
          padding: 12px 16px;
        }
        .quill-composer-wrapper .ql-editor.ql-blank::before {
          left: 16px;
          font-style: normal;
          color: #a3a3a3;
        }
      `}</style>
    </div>
  );
}

export default function Messaging() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [tab, setTab] = useState<"inbox" | "archive">("inbox");
  const [activeThreadId, setActiveThreadId] = useState(INITIAL_THREADS[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replying, setReplying] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [threads, isTyping]);

  const activeThread =
    threads.find((t) => t.id === activeThreadId) ?? threads[0];
  const hasThread = activeThread.messages.length > 0;

  const handleSendMessage = (html: string) => {
    const newMessage: ThreadMessage = {
      id: `m_${Date.now()}`,
      from: CURRENT_USER,
      to: activeThread.sender.name,
      format: "html",
      body: [html],
    };

    setThreads((prevThreads) =>
      prevThreads.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            preview: html.replace(/<[^>]*>/g, ""),
            messages: [...t.messages, newMessage],
          };
        }
        return t;
      }),
    );

    setReplying(false);

    // Simulate Automated Response
    setIsTyping(true);
    setTimeout(() => {
      const simulatedResponse: ThreadMessage = {
        id: `m_reply_${Date.now()}`,
        from: activeThread.sender,
        to: CURRENT_USER.name,
        format: "plain",
        body: [
          "Got it! Thanks for sending that over. I've noted down your updates and will review them shortly.",
        ],
      };

      setThreads((prevThreads) =>
        prevThreads.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              preview: simulatedResponse.body[0],
              messages: [...t.messages, simulatedResponse],
            };
          }
          return t;
        }),
      );
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Left Sidebar */}
      <div className="flex w-80 shrink-0 flex-col border-r border-neutral-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setTab("inbox")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                tab === "inbox"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              Inbox
            </button>
            <button
              type="button"
              onClick={() => setTab("archive")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                tab === "archive"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              Archive
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 px-4 pb-2 text-sm text-neutral-500">
          <Icon icon="mdi:swap-vertical" size={14} />
          <span>Newest</span>
          <Icon icon="mdi:chevron-down" size={14} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {tab === "inbox" ? (
            threads.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                active={thread.id === activeThreadId}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setReplying(false);
                }}
              />
            ))
          ) : (
            <p className="px-4 py-6 text-center text-sm text-neutral-400">
              No archived messages
            </p>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {hasThread ? (
          <>
            <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeThread.sender.avatarUrl}
                  alt={activeThread.sender.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold text-neutral-900">
                      {activeThread.sender.name}
                    </span>{" "}
                    <span className="text-neutral-400">
                      &lt;{activeThread.sender.email}&gt;
                    </span>
                  </p>
                  <p className="text-xs text-neutral-400">
                    Subject: {activeThread.subject}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs text-neutral-400">
                  <p>{activeThread.timestamp}</p>
                  <p>({activeThread.relativeTime})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplying((r) => !r)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <Icon icon="mdi:reply-outline" size={18} />
                </button>
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="More actions"
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <Icon icon="mdi:dots-horizontal" size={18} />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Icon icon="mdi:archive-outline" size={16} />
                        Archive
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Icon icon="mdi:trash-can-outline" size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 px-6 py-5">
              {activeThread.messages.map((message) => (
                <MessageBody key={message.id} message={message} />
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 pl-11">
                  <Icon icon="eos-icons:three-dots-loading" size={24} />
                  <span>{activeThread.sender.name} is responding...</span>
                </div>
              )}

              <div ref={messagesEndRef} />

              {!replying && (
                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReplying(true)}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <Icon icon="mdi:reply-outline" size={16} />
                    Reply
                  </button>
                </div>
              )}

              {replying && (
                <ReplyComposer
                  recipientEmail={activeThread.sender.email}
                  onClose={() => setReplying(false)}
                  onSend={handleSendMessage}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
            Select a message to read
          </div>
        )}
      </div>
    </div>
  );
}
