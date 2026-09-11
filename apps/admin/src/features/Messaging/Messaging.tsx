"use client";

import {Icon} from "@mcc/ui";
import dynamic from "next/dynamic";
import {useMemo, useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import "react-quill-new/dist/quill.snow.css";
import {searchRecipients} from "./services/recipients.service";
import {listMessageTemplates, sendMessage} from "./services/messages.service";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-32 w-full animate-pulse rounded-md bg-gray-100" />
  ),
});

interface RecipientOption {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
}

function RecipientPicker({
  value,
  onChange,
}: {
  value: RecipientOption | null;
  onChange: (recipient: RecipientOption | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const {data: results = [], isFetching} = useQuery({
    queryKey: ["recipients-search", query],
    queryFn: () =>
      searchRecipients(query).then((rows) =>
        rows.map(
          (r): RecipientOption => ({
            id: r.user_id,
            name: r.full_name,
            email: r.email,
            role: r.role,
          }),
        ),
      ),
    enabled: open && query.trim().length > 0,
  });

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{value.name}</p>
          <p className="text-xs text-neutral-500">
            {value.email} · {value.role}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-neutral-400 hover:text-neutral-600"
          aria-label="Change recipient"
        >
          <Icon icon="mdi:close" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Icon
          icon="mdi:magnify"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search a student or teacher by name or email"
          className="w-full rounded-xl border border-neutral-200 py-2.5 pl-9 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
        />
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
          {isFetching && (
            <p className="px-4 py-3 text-sm text-neutral-400">Searching…</p>
          )}
          {!isFetching && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-neutral-400">No matches found.</p>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                onChange(r);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full flex-col items-start px-4 py-2.5 text-left hover:bg-neutral-50"
            >
              <span className="text-sm font-medium text-neutral-900">{r.name}</span>
              <span className="text-xs text-neutral-500">
                {r.email} · {r.role}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Messaging() {
  const [recipient, setRecipient] = useState<RecipientOption | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const {data: templates = []} = useQuery({
    queryKey: ["message-templates"],
    queryFn: listMessageTemplates,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      sendMessage({
        recipient_id: recipient!.id,
        body: body.replace(/<[^>]*>/g, "").trim().length > 0 ? body : undefined,
        subject: subject.trim() || undefined,
        template_id: templateId || undefined,
      }),
    onSuccess: () => {
      setRecipient(null);
      setTemplateId("");
      setSubject("");
      setBody("");
    },
  });

  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{list: "ordered"}, {list: "bullet"}],
        ["link"],
        ["clean"],
      ],
    }),
    [],
  );

  const bodyIsEmpty = body.replace(/<[^>]*>/g, "").trim().length === 0;
  const canSend = !!recipient && (!bodyIsEmpty || !!templateId) && !sendMutation.isPending;

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-1 flex items-center gap-2">
        <Icon icon="mdi:email-plus-outline" size={20} />
        <h1 className="text-lg font-semibold text-neutral-900">New message</h1>
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Send a message directly to a student or teacher&apos;s email.
      </p>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-900">
            To
          </label>
          <RecipientPicker value={recipient} onChange={setRecipient} />
        </div>

        {templates.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-900">
              Template <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <select
              value={templateId}
              onChange={(e) => {
                const id = e.target.value;
                setTemplateId(id);
                const template = templates.find((t) => t.template_id === id);
                if (template) {
                  setSubject(template.subject);
                  setBody(template.body);
                }
              }}
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
            >
              <option value="">Write a custom message</option>
              {templates.map((t) => (
                <option key={t.template_id} value={t.template_id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-900">
            Subject <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-900">
            Message
          </label>
          <div className="quill-message-wrapper overflow-hidden rounded-xl border border-neutral-200">
            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              modules={modules}
              placeholder="Write your message here..."
            />
          </div>
        </div>
      </div>

      {sendMutation.isError && (
        <p className="mt-4 text-sm text-red-500">
          Failed to send message. Please try again.
        </p>
      )}
      {sendMutation.isSuccess && (
        <p className="mt-4 text-sm text-emerald-600">Message sent.</p>
      )}

      <div className="mt-6 flex justify-end border-t border-neutral-100 pt-5">
        <button
          type="button"
          disabled={!canSend}
          onClick={() => sendMutation.mutate()}
          className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {sendMutation.isPending ? "Sending…" : "Send message"}
        </button>
      </div>

      <style jsx global>{`
        .quill-message-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e5e5;
          padding: 8px 16px;
        }
        .quill-message-wrapper .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 0.875rem;
          min-height: 140px;
        }
        .quill-message-wrapper .ql-editor {
          min-height: 140px;
          padding: 12px 16px;
        }
        .quill-message-wrapper .ql-editor.ql-blank::before {
          left: 16px;
          font-style: normal;
          color: #a3a3a3;
        }
      `}</style>
    </div>
  );
}
