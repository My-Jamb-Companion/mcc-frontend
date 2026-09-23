"use client";

import { useState } from "react";
import { Icon } from "@mcc/ui";
import { useAskCopilot } from "../hooks/useCopilot";

interface CopilotMessage {
  role: "admin" | "copilot";
  text: string;
  generated?: boolean;
}

const STARTER_PROMPTS = [
  "Give me a platform health summary",
  "Which students are at risk of churning?",
  "Who are my top-performing teachers?",
];

export function Copilot() {
  const askCopilot = useAskCopilot();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setDraft("");
    setError(null);
    setMessages((prev) => [...prev, { role: "admin", text: trimmed }]);

    try {
      const result = await askCopilot.mutateAsync(trimmed);
      setMessages((prev) => [
        ...prev,
        { role: "copilot", text: result.reply, generated: result.generated },
      ]);
    } catch {
      setError("Couldn't reach the Copilot. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon icon="ph:sparkle-fill" size={18} className="text-violet-600" />
        <h3 className="text-lg font-bold text-neutral-900">Copilot</h3>
      </div>
      <p className="text-sm text-neutral-400 mt-0.5">
        Ask anything about the platform — grounded in real, live analytics.
      </p>

      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-400">Try one of these to get started:</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  message.role === "admin"
                    ? "ml-auto bg-violet-600 text-white"
                    : "bg-white border border-gray-100 text-gray-800"
                }`}
              >
                <p>{message.text}</p>
                {message.role === "copilot" && message.generated === false && (
                  <p className="text-xs text-gray-400 mt-1">
                    AI is currently unavailable — this is a placeholder reply.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex items-end gap-2 mt-3 pt-3 border-t border-gray-100">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the Copilot about the platform..."
            rows={2}
            className="flex-1 resize-none rounded-md border border-gray-200 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/30"
          />
          <button
            type="button"
            disabled={!draft.trim() || askCopilot.isPending}
            onClick={() => send(draft)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {askCopilot.isPending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Copilot;
