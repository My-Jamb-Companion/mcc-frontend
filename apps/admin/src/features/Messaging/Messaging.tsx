"use client";

import {Icon} from "@mcc/ui";
import {useEffect, useState} from "react";
import ComposeModal from "./components/ComposeModal";
import ConversationList from "./components/ConversationList";
import ConversationThread from "./components/ConversationThread";

/** The messaging inbox: conversations with students and teachers on the left, the open one on the right. */
export default function Messaging() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  // /messaging?user=<id> opens that conversation (a link from a notice).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("user");
    if (id) setSelectedId(id);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Messaging</h1>
          <p className="text-sm text-neutral-500">Messages to and from students and teachers.</p>
        </div>
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Icon icon="mdi:email-plus-outline" size={16} /> New message
        </button>
      </div>

      <div className="grid min-h-[480px] flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className={`${selectedId ? "hidden lg:block" : ""} min-h-0 border-neutral-100 lg:border-r`}>
          <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className={`${selectedId ? "" : "hidden lg:flex"} min-h-0 flex-col`}>
          {selectedId ? (
            <ConversationThread key={selectedId} userId={selectedId} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
              <Icon icon="mdi:message-text-outline" size={32} className="text-neutral-300" />
              <p className="text-sm text-neutral-500">Pick a conversation to read it and reply, or start a new message.</p>
            </div>
          )}
        </div>
      </div>

      <ComposeModal open={composing} onClose={() => setComposing(false)} onSent={setSelectedId} />
    </div>
  );
}
