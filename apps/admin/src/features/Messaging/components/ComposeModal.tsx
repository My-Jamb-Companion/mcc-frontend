"use client";

import {Modal, showError} from "@mcc/ui";
import {useEffect, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {extractApiError} from "@mcc/api";
import {listMessageTemplates, sendMessage} from "../services/messages.service";
import {htmlToText, MAX_REPLY_LENGTH} from "../helper/messaging";
import {CONVERSATIONS_KEY} from "../hooks/useConversations";
import RecipientPicker from "./RecipientPicker";
import type {RecipientOption} from "./RecipientPicker";

const field = "w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400";

/** Start a message to a student or teacher. If they already have a conversation, it joins it. */
export default function ComposeModal({open, onClose, onSent}: {open: boolean; onClose: () => void; onSent: (userId: string) => void}) {
  const queryClient = useQueryClient();
  const [recipient, setRecipient] = useState<RecipientOption | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const {data: templates = []} = useQuery({queryKey: ["message-templates"], queryFn: listMessageTemplates, enabled: open});

  // A fresh form each time it opens.
  useEffect(() => {
    if (open) {
      setRecipient(null);
      setTemplateId("");
      setSubject("");
      setBody("");
    }
  }, [open]);

  const send = useMutation({
    mutationFn: () =>
      sendMessage({
        recipient_id: recipient!.id,
        body: body.trim() || undefined,
        subject: subject.trim() || undefined,
        template_id: templateId || undefined,
      }),
    onSuccess: () => {
      const id = recipient!.id;
      void queryClient.invalidateQueries({queryKey: CONVERSATIONS_KEY});
      void queryClient.invalidateQueries({queryKey: ["admin-messages", "thread", id]});
      onSent(id);
      onClose();
    },
    onError: (error) => showError(extractApiError(error, "Failed to send the message. Please try again.")),
  });

  const canSend = !!recipient && (body.trim().length > 0 || !!templateId) && !send.isPending;

  return (
    <Modal open={open} onClose={onClose} title="New message" maxWidth="max-w-xl" x>
      <div className="space-y-5">
        <p className="text-sm text-neutral-500">
          Send a message to a student or teacher. They get it by email and in the app, and can reply to you here.
        </p>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-900">To</label>
          <RecipientPicker value={recipient} onChange={setRecipient} />
        </div>

        {templates.length > 0 && (
          <div>
            <label htmlFor="msg-template" className="mb-1.5 block text-sm font-medium text-neutral-900">
              Template <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <select
              id="msg-template"
              value={templateId}
              onChange={(e) => {
                const id = e.target.value;
                setTemplateId(id);
                const template = templates.find((t) => t.template_id === id);
                if (template) {
                  setSubject(template.subject ?? "");
                  setBody(htmlToText(template.body));
                }
              }}
              className={field}
            >
              <option value="">Write a custom message</option>
              {templates.map((t) => (
                <option key={t.template_id} value={t.template_id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="msg-subject" className="mb-1.5 block text-sm font-medium text-neutral-900">
            Subject <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input id="msg-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className={field} />
        </div>

        <div>
          <label htmlFor="msg-body" className="mb-1.5 block text-sm font-medium text-neutral-900">Message</label>
          <textarea
            id="msg-body"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_REPLY_LENGTH))}
            rows={7}
            placeholder="Write your message here..."
            className={`${field} resize-y leading-relaxed`}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-800">Cancel</button>
          <button
            type="button"
            disabled={!canSend}
            onClick={() => send.mutate()}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {send.isPending ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
