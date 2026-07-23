"use client";

import {useMemo, useState} from "react";
import {Icon} from "@iconify/react";
import {Modal} from "@mcc/ui";

type Recipient = {
  id: string;
  name: string;
  role: "Student" | "Teacher";
};

const SAMPLE_RECIPIENTS: Recipient[] = [
  {id: "1", name: "Emmanuel Okafor", role: "Student"},
  {id: "2", name: "Misturah Bello", role: "Student"},
  {id: "3", name: "Mo Abiodun", role: "Teacher"},
  {id: "4", name: "Chiamaka Nwosu", role: "Student"},
];

function RecipientSelect({
  value,
  onChange,
}: {
  value: Recipient | null;
  onChange: (recipient: Recipient) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(
    () =>
      SAMPLE_RECIPIENTS.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-left"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? value.name : "Find student or teacher"}
        </span>
        <Icon
          icon="mdi:chevron-down"
          width={16}
          height={16}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1.5 text-sm outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {results.map((recipient) => (
              <li key={recipient.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(recipient);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>{recipient.name}</span>
                  <span className="text-xs text-gray-400">
                    {recipient.role}
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-gray-400">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ShareSessionLink({
  open,
  link,
  onCancel,
  onSendLink,
}: {
  open: boolean;
  link?: string;
  onCancel?: () => void;
  onSendLink?: (payload: {recipient: Recipient; link: string}) => void;
}) {
  const sessionLink = link ?? "https://mcc.com/shots/26158008-certifi...";
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [copied, setCopied] = useState(false);

  const canSend = recipient !== null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access may be blocked in some environments; fail silently.
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-900">
          Share session link.
        </h2>

        <div className="mt-5">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Who are you sharing with?
          </label>
          <RecipientSelect value={recipient} onChange={setRecipient} />
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            or copy link
          </label>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white">
            <span className="flex-1 text-sm text-gray-400 truncate">
              {sessionLink}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-sm font-semibold text-gray-800 shrink-0 hover:text-black transition-colors"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-full border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              recipient && onSendLink?.({recipient, link: sessionLink})
            }
            disabled={!canSend}
            className="flex-1 py-3 rounded-full font-semibold transition-colors bg-violet-600 text-white hover:bg-violet-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Send link
          </button>
        </div>
      </div>
    </Modal>
  );
}
