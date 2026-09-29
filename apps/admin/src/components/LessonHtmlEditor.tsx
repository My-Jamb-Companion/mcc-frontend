"use client";

import {useMemo, useRef, useState} from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {Icon, showError} from "@mcc/ui";
import {uploadMedia} from "@/src/features/courses/services/media.service";

// react-quill-new touches `document` at import time, so it must never run
// on the server -- same reasoning as the messaging compose box
// (SendMessage.tsx) that already depends on it.
// `as any` -- next/dynamic's wrapper type doesn't declare ref forwarding
// even though the underlying class component supports it at runtime,
// which this file needs for the image-upload/symbol-insert handlers.
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100" />,
}) as any;

// The H2 button is load-bearing, not decorative: the student-side viewer
// (apps/learner/.../InteractiveLessonContent.tsx) splits a lesson into
// one-block-per-heading pages by looking for top-level <h2> elements in
// this HTML.
const TOOLBAR = [
  [{header: [2, false]}],
  ["bold", "italic", "underline", "strike"],
  [{script: "sub"}, {script: "super"}],
  [{list: "ordered"}, {list: "bullet"}],
  ["link", "image"],
  ["clean"],
];

const SYMBOL_GROUPS: {label: string; symbols: string[]}[] = [
  {
    label: "Math",
    symbols: ["±", "×", "÷", "=", "≠", "≈", "≤", "≥", "√", "∑", "∫", "∞", "π", "°", "²", "³", "·", "%"],
  },
  {
    label: "Greek",
    symbols: ["α", "β", "γ", "δ", "ε", "θ", "λ", "μ", "ν", "ρ", "σ", "τ", "φ", "ψ", "ω", "Δ", "Σ", "Ω"],
  },
  {
    label: "Arrows & sets",
    symbols: ["→", "←", "↔", "⇌", "↑", "↓", "∈", "∉", "⊂", "⊆", "∪", "∩", "∅"],
  },
  {
    label: "Physics & chem",
    symbols: ["Å", "ℏ", "′", "″", "∂", "∆", "∝", "∴", "∵", "₀", "₁", "₂", "₃", "ₓ"],
  },
];

function SymbolPicker({onInsert}: {onInsert: (symbol: string) => void}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()} // keep focus (and selection) in the editor
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        <span className="font-serif italic">Ω</span>
        Insert symbol
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
            {SYMBOL_GROUPS.map((group) => (
              <div key={group.label} className="mb-2 last:mb-0">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-1">
                  {group.symbols.map((symbol) => (
                    <button
                      key={symbol}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onInsert(symbol);
                        setOpen(false);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function LessonHtmlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  // `any` -- react-quill-new ships its own types but the dynamic() wrapper
  // erases them; only .getEditor() is used here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillRef = useRef<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  function getEditor() {
    return quillRef.current?.getEditor?.();
  }

  function insertSymbol(symbol: string) {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection(true) || {index: editor.getLength()};
    editor.insertText(range.index, symbol, "user");
    editor.setSelection(range.index + symbol.length, 0);
  }

  function handleImageClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const editor = getEditor();
      if (!editor) return;

      const range = editor.getSelection(true) || {index: editor.getLength()};
      setUploadingImage(true);
      try {
        // Real upload, real URL -- Quill's default image handler just
        // inlines a base64 data URI, which would bloat the saved HTML and
        // never resolve to a stable, cacheable image. Same presigned-URL
        // upload path used for course cover images and lecture video.
        const url = await uploadMedia(file, "lessons");
        editor.insertEmbed(range.index, "image", url, "user");
        editor.setSelection(range.index + 1, 0);
      } catch {
        showError("Failed to upload image. Please try again.");
      } finally {
        setUploadingImage(false);
      }
    };
    input.click();
  }

  const modules = useMemo(
    () => ({
      toolbar: {
        container: TOOLBAR,
        handlers: {image: handleImageClick},
      },
    }),
    // Handler reads quillRef.current at call time, so it never needs to be
    // recreated -- Quill only reads this config once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="lesson-html-editor-wrapper rounded-xl border border-gray-200 bg-white overflow-hidden">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Write the lesson content. Use Heading 2 to start a new block -- students will see one block at a time."
      />

      <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/60 px-3 py-2">
        <SymbolPicker onInsert={insertSymbol} />
        {uploadingImage && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Icon icon="lucide:loader-2" size={12} className="animate-spin" />
            Uploading image…
          </span>
        )}
      </div>

      <style jsx global>{`
        .lesson-html-editor-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 12px;
        }
        .lesson-html-editor-wrapper .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .lesson-html-editor-wrapper .ql-editor {
          min-height: 280px;
          padding: 12px 16px;
        }
        .lesson-html-editor-wrapper .ql-editor.ql-blank::before {
          left: 16px;
          font-style: normal;
          color: #9ca3af;
        }
        .lesson-html-editor-wrapper .ql-editor img {
          max-width: 100%;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
