"use client";
import {Icon} from "@mcc/ui";
import {useEffect, useRef, useState} from "react";

interface Participant {
  name: string;
  email: string;
  avatarUrl: string;
}

interface ThreadMessage {
  id: string;
  from: Participant;
  to: string;
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

const CURRENT_USER_EMAIL = "lesalexand@gmail.com";

const THREADS: Thread[] = [
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
        body: [
          "Dear Bright",
          "I hope this message finds you well. I wanted to reach out to discuss our upcoming project timeline and ensure we're aligned on the next steps.",
          "Please let me know if you have any questions or need additional information. Looking forward to your feedback.",
          "Thank you for your attention to this matter.",
        ],
      },
      {
        id: "m2",
        from: {
          name: "Bright",
          email: "bright@gmail.com",
          avatarUrl: "https://i.pravatar.cc/64?img=68",
        },
        to: "Leslie Alexander",
        body: [
          "Dear Leslie",
          "I hope this message finds you well. I wanted to reach out to discuss our upcoming project timeline and ensure we're aligned on the next steps.",
          "Please let me know if you have any questions or need additional information. Looking forward to your feedback.",
          "Thank you for your attention to this matter.",
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
    subject: "PLEASE CHECK IN.",
    preview:
      "Hey, just wanted to give you a heads-up that I'll be there next time. I'm really looki...",
    date: "",
    timestamp: "",
    relativeTime: "",
    messages: [],
  },
  {
    id: "t3",
    sender: {
      name: "Leslie Alexander",
      email: "lesalexand@gmail.com",
      avatarUrl: "https://i.pravatar.cc/64?img=47",
    },
    subject: "PLEASE CHECK IN.",
    preview:
      "Hey, just wanted to give you a heads-up that I'll be there next time. I'm really looki...",
    date: "",
    timestamp: "",
    relativeTime: "",
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

function CollapsedMessageBar({
  count,
  onExpand,
}: {
  count: number;
  onExpand: () => void;
}) {
  return (
    <div className="relative my-4 flex items-center border-t border-neutral-200">
      <span className="absolute left-0 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-500">
        {count}
      </span>
      <button
        type="button"
        onClick={onExpand}
        aria-label="Expand thread"
        className="absolute right-0 -top-3 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 hover:text-neutral-600"
      >
        <Icon icon="mdi:unfold-more-horizontal" size={16} />
      </button>
    </div>
  );
}

function MessageBody({message}: {message: ThreadMessage}) {
  return (
    <div>
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
      <div className="mt-4 space-y-4 pl-11 text-sm leading-relaxed text-neutral-700">
        {message.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

function ReplyComposer({
  recipientEmail,
  onClose,
  onSend,
}: {
  recipientEmail: string;
  onClose: () => void;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200">
      <div className="flex items-center justify-between px-4 py-2.5 text-sm text-neutral-600">
        <span>{recipientEmail}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reply"
          className="text-neutral-400 hover:text-neutral-600"
        >
          <Icon icon="mdi:close" size={16} />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write reply here..."
        rows={5}
        className="w-full resize-none border-t border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
      />
      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2.5">
        <div className="flex items-center gap-3 text-neutral-400">
          <Icon
            icon="mdi:format-bold"
            size={16}
            className="cursor-pointer hover:text-neutral-600"
          />
          <Icon
            icon="mdi:format-italic"
            size={16}
            className="cursor-pointer hover:text-neutral-600"
          />
          <Icon
            icon="mdi:format-underline"
            size={16}
            className="cursor-pointer hover:text-neutral-600"
          />
          <Icon
            icon="mdi:format-list-bulleted"
            size={16}
            className="cursor-pointer hover:text-neutral-600"
          />
          <Icon
            icon="mdi:format-list-checks"
            size={16}
            className="cursor-pointer hover:text-neutral-600"
          />
          <Icon
            icon="mdi:link-variant"
            size={16}
            className="cursor-pointer hover:text-neutral-600"
          />
          <Icon
            icon="mdi:image-outline"
            size={16}
            className="cursor-pointer hover:text-neutral-600"
          />
          <Icon
            icon="mdi:paperclip"
            size={16}
            className="cursor-pointer hover:text-neutral-600"
          />
        </div>
        <button
          type="button"
          onClick={() => text.trim() && onSend(text)}
          className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function Messaging() {
  const [tab, setTab] = useState<"inbox" | "archive">("inbox");
  const [activeThreadId, setActiveThreadId] = useState(THREADS[0].id);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replying, setReplying] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeThread =
    THREADS.find((t) => t.id === activeThreadId) ?? THREADS[0];
  const hasThread = activeThread.messages.length > 0;
  const firstMessage = activeThread.messages[0];
  const restMessages = activeThread.messages.slice(1);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Left: thread list */}
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
            THREADS.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                active={thread.id === activeThreadId}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setExpanded(false);
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

      {/* Right: thread detail */}
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
                  <p className="text-xs text-neutral-400">To: Me</p>
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
                <Icon
                  icon="mdi:reply-outline"
                  size={18}
                  className="cursor-pointer text-neutral-400 hover:text-neutral-600"
                />
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

            <div className="flex-1 px-6 py-5">
              {!expanded ? (
                <>
                  <p className="text-sm font-medium text-neutral-900">
                    Dear Bright
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                    I hope this message finds you well. I wanted to reach out to
                    discuss our upcoming project timeline and ensure we&apos;re
                    aligned on the next steps....
                  </p>
                  {restMessages.length > 0 && (
                    <CollapsedMessageBar
                      count={restMessages.length}
                      onExpand={() => setExpanded(true)}
                    />
                  )}
                  {restMessages.map((message) => (
                    <MessageBody key={message.id} message={message} />
                  ))}
                </>
              ) : (
                <MessageBody message={firstMessage} />
              )}

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
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <Icon icon="mdi:share-outline" size={16} />
                    Forward
                  </button>
                </div>
              )}

              {replying && (
                <ReplyComposer
                  recipientEmail={CURRENT_USER_EMAIL}
                  onClose={() => setReplying(false)}
                  onSend={() => setReplying(false)}
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
