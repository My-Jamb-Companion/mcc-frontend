"use client";

import {Icon, Modal} from "@mcc/ui";
import {useConversation} from "../hooks/useAiStudio";
import {ApiConversationItem} from "../services/ai-studio.service";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})} | ${d.toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"})}`;
}

export default function ConversationDetailModal({
  conversation,
  onClose,
}: {
  conversation: ApiConversationItem | null;
  onClose: () => void;
}) {
  const {data, isLoading} = useConversation(
    conversation?.conversation_id ?? null,
    conversation?.is_session ?? null,
  );

  return (
    <Modal open={!!conversation} onClose={onClose}>
      <div className="flex flex-col gap-4 max-h-[75vh]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{conversation?.title}</h2>
            <p className="text-sm text-muted mt-1">
              {conversation?.full_name} &middot; {conversation?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors shrink-0"
          >
            <Icon icon="lucide:x" size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pr-1">
          {isLoading ? (
            <p className="text-sm text-muted py-8 text-center">Loading…</p>
          ) : !data || data.messages.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">
              No messages found.
            </p>
          ) : (
            data.messages.map((message) => (
              <div key={message.chat_id} className="flex flex-col gap-2">
                <div className="self-end max-w-[85%] rounded-2xl rounded-tr-sm bg-violet-600 text-white px-4 py-2.5 text-sm">
                  {message.user_message}
                </div>
                {message.ai_response && (
                  <div className="self-start max-w-[85%] rounded-2xl rounded-tl-sm bg-gray-100 text-gray-800 px-4 py-2.5 text-sm">
                    {message.ai_response}
                  </div>
                )}
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <Icon icon="lucide:clock" size={12} />
                  {formatDateTime(message.timestamp)}
                  {message.total_tokens != null && (
                    <>
                      <span>&middot;</span>
                      <span>{message.total_tokens} tokens</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
