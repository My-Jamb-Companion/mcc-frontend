"use client";

import dynamic from "next/dynamic";
import {useMemo, useState} from "react";
import {Icon, Modal} from "@mcc/ui";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-32 w-full animate-pulse rounded-xl bg-gray-100" />
  ),
});

type Teacher = {
  id: string;
  name: string;
};

const SAMPLE_TEACHERS: Teacher[] = [
  {id: "1", name: "Emmanuel Okafor"},
  {id: "2", name: "Misturah Bello"},
  {id: "3", name: "David Adeyemi"},
  {id: "4", name: "Chiamaka Nwosu"},
];

function TeacherSelect({
  value,
  onChange,
}: {
  value: Teacher | null;
  onChange: (teacher: Teacher) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(
    () =>
      SAMPLE_TEACHERS.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase()),
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
          {value ? value.name : "Select teacher"}
        </span>
        <Icon
          icon="mdi:chevron-down"
          size={16}
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
              placeholder="Search teachers..."
              className="w-full px-2 py-1.5 text-sm outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {results.map((teacher) => (
              <li key={teacher.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(teacher);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  {teacher.name}
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-gray-400">
                No teachers found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const QUILL_MODULES = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{list: "ordered"}, {list: "bullet"}],
    ["link"],
    ["clean"],
  ],
};

export default function SendMessage({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose?: () => void;
  onSend?: (payload: {teacher: Teacher; message: string}) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [message, setMessage] = useState("");

  const canProceedStep1 = teacher !== null;
  const messageIsEmpty = message.replace(/<[^>]*>/g, "").trim().length === 0;
  const canSend = !messageIsEmpty;

  const resetAndClose = () => {
    setStep(1);
    setTeacher(null);
    setMessage("");
    onClose?.();
  };

  const handlePrimaryClick = () => {
    if (step === 1) {
      if (canProceedStep1) setStep(2);
      return;
    }
    if (canSend && teacher) {
      onSend?.({teacher, message});
      setStep(1);
      setTeacher(null);
      setMessage("");
    }
  };

  return (
    <Modal open={open} onClose={resetAndClose}>
      <div className="w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 shrink-0">
            <Icon
              icon="mdi:email-outline"
              size={18}
              className="text-gray-800"
            />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Send message</h2>
        </div>

        <div className="mt-4 bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
                aria-label="Back"
              >
                <Icon icon="mdi:arrow-left" size={18} />
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Step {step} of 2</span>
              <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all duration-300"
                  style={{width: step === 1 ? "50%" : "100%"}}
                />
              </div>
            </div>
          </div>

          {step === 1 ? (
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Find Teacher
              </label>
              <TeacherSelect value={teacher} onChange={setTeacher} />
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Message{" "}
                {teacher ? (
                  <span className="text-gray-400 font-normal">
                    to {teacher.name}
                  </span>
                ) : null}
              </label>
              <div className="quill-send-message-wrapper rounded-xl border border-gray-200 bg-white overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={message}
                  onChange={setMessage}
                  modules={QUILL_MODULES}
                  placeholder="Type your message..."
                />
              </div>

              <style jsx global>{`
                .quill-send-message-wrapper .ql-toolbar.ql-snow {
                  border: none;
                  border-bottom: 1px solid #e5e7eb;
                  padding: 8px 12px;
                }
                .quill-send-message-wrapper .ql-container.ql-snow {
                  border: none;
                  font-family: inherit;
                  font-size: 0.875rem;
                }
                .quill-send-message-wrapper .ql-editor {
                  min-height: 96px;
                  padding: 12px 16px;
                }
                .quill-send-message-wrapper .ql-editor.ql-blank::before {
                  left: 16px;
                  font-style: normal;
                  color: #9ca3af;
                }
              `}</style>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={resetAndClose}
            className="flex-1 py-3 rounded-full border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrimaryClick}
            disabled={step === 1 ? !canProceedStep1 : !canSend}
            className="flex-1 py-3 rounded-full font-semibold transition-colors bg-violet-600 text-white hover:bg-violet-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Send message
          </button>
        </div>
      </div>
    </Modal>
  );
}
