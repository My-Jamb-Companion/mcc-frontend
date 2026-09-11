"use client";

import { useState } from "react";
import { Button } from "@mcc/ui";
import { useAskAdvisor } from "./useAdvisor";

interface AdvisorMessage {
  role: "parent" | "advisor";
  text: string;
  generated?: boolean;
}

interface ChildAdvisorProps {
  childId: string;
  childName: string;
}

export const ChildAdvisor = ({ childId, childName }: ChildAdvisorProps) => {
  const askAdvisor = useAskAdvisor(childId);
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;

    setDraft("");
    setError(null);
    setMessages((prev) => [...prev, { role: "parent", text }]);

    try {
      const result = await askAdvisor.mutateAsync(text);
      setMessages((prev) => [
        ...prev,
        { role: "advisor", text: result.reply, generated: result.generated },
      ]);
    } catch {
      setError("Couldn't reach the Advisor. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section>
      <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
        Ask the Advisor
      </h2>
      <p className="text-xs text-muted mb-3">
        Ask anything about {childName}&apos;s progress — grounded in their real performance,
        sessions, and teachers.
      </p>

      <div className="rounded-lg border border-muted/20 p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted">
            {`No questions yet. Try "How is ${childName} doing?"`}
          </p>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  message.role === "parent"
                    ? "ml-auto bg-primary text-white"
                    : "bg-muted/10"
                }`}
              >
                <p>{message.text}</p>
                {message.role === "advisor" && message.generated === false && (
                  <p className="text-xs text-muted mt-1">
                    AI is currently unavailable — this is a placeholder reply.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-end gap-2 pt-2 border-t border-muted/20">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${childName}...`}
            rows={2}
            className="flex-1 resize-none rounded-md border border-muted/20 p-2 text-sm outline-none focus:ring-2 ring-primary/30"
          />
          <Button
            onClick={handleSend}
            loading={askAdvisor.isPending}
            disabled={!draft.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ChildAdvisor;
