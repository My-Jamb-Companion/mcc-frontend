"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {Icon, showError} from "@mcc/ui";
import {uploadMedia} from "@/src/features/courses/services/media.service";
import {planPaste} from "@/src/features/courses/helper/lessonPaste";

// react-quill-new touches `document` at import time, so it must never run
// on the server -- same reasoning as the messaging compose box
// (SendMessage.tsx) that already depends on it.
// next/dynamic does NOT forward `ref` to the component it loads, so a plain
// `<ReactQuill ref=...>` leaves the ref empty and every handler that needs the
// editor (paste cleaning, image upload, symbol insert) silently does nothing.
// The loaded component is wrapped to take the ref as an ordinary prop instead.
// `any` -- react-quill-new ships its own types but the dynamic() wrapper erases them.
const ReactQuill = dynamic(
  async () => {
    const {default: Quill} = await import("react-quill-new");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function QuillWithRef({forwardedRef, ...props}: any) {
      return <Quill ref={forwardedRef} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100" />,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any;

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

const PICKER_WIDTH = 288; // w-72
const PICKER_HEIGHT = 300; // enough for all four groups
const PICKER_GAP = 4;

function SymbolPicker({onInsert}: {onInsert: (symbol: string) => void}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Where the panel sits, in viewport coordinates; null = closed.
  const [pos, setPos] = useState<{left: number; top?: number; bottom?: number} | null>(null);

  // The editor sits inside overflow-hidden boxes (its own frame and the modal's scroll area),
  // which clipped the panel to a sliver. So it is portalled to <body> and positioned against
  // the button, opening upward when there is no room below (the button sits at the bottom).
  function toggle() {
    if (pos) return setPos(null);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - PICKER_WIDTH - 8));
    const roomBelow = window.innerHeight - rect.bottom;
    setPos(
      roomBelow >= PICKER_HEIGHT + PICKER_GAP
        ? {left, top: rect.bottom + PICKER_GAP}
        : {left, bottom: window.innerHeight - rect.top + PICKER_GAP},
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onMouseDown={(e) => e.preventDefault()} // keep focus (and selection) in the editor
        onClick={toggle}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        <span className="font-serif italic">Ω</span>
        Insert symbol
      </button>

      {pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setPos(null)} />
            <div
              style={{left: pos.left, top: pos.top, bottom: pos.bottom, width: PICKER_WIDTH}}
              className="fixed z-[61] max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
            >
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
                          setPos(null);
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
          </>,
          document.body,
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
  // The editor's root element, once Quill has created it. Set from the ref callback, which
  // React calls right after Quill mounts, so there is nothing to poll for.
  const [editorRoot, setEditorRoot] = useState<HTMLElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setQuillRef = useCallback((instance: any) => {
    quillRef.current = instance;
    setEditorRoot(instance?.getEditor?.()?.root ?? null);
  }, []);

  function getEditor() {
    return quillRef.current?.getEditor?.();
  }

  // Pasted content (from Google Docs, Word, a PDF, a web page) is cleaned before Quill
  // sees it, ahead of Quill's own paste handler, so formatting carries through to students:
  // headings, bold/italic, links, lists, tables and alignment are kept, the clutter around
  // them is dropped, and text copied from a PDF has its page-width line breaks joined back
  // into paragraphs (see lessonPaste.ts). A table's <th>/<thead> are also rewritten there,
  // since Quill has no matching blot and would merge the header cells' text together.
  // A single line, or content copied from this editor, is left to Quill.
  useEffect(() => {
    if (!editorRoot) return;

    function handlePaste(e: ClipboardEvent) {
      const planned = planPaste(e.clipboardData?.getData("text/html") ?? "", e.clipboardData?.getData("text/plain") ?? "");
      if (planned === null) return;
      const editor = getEditor();
      if (!editor) return;

      e.preventDefault();
      e.stopPropagation();

      const range = editor.getSelection(true) || {index: Math.max(0, editor.getLength() - 1), length: 0};
      if (range.length) editor.deleteText(range.index, range.length, "user");
      const before = editor.getLength();
      editor.clipboard.dangerouslyPasteHTML(range.index, planned, "user");
      // Put the cursor after what was pasted, and keep it in view.
      editor.setSelection(range.index + (editor.getLength() - before), 0, "silent");
      editor.scrollSelectionIntoView?.();
    }

    // Capture phase: ahead of Quill's own paste handler.
    editorRoot.addEventListener("paste", handlePaste, true);
    return () => editorRoot.removeEventListener("paste", handlePaste, true);
  }, [editorRoot]);

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
        forwardedRef={setQuillRef}
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
        .lesson-html-editor-wrapper .ql-editor th {
          border: 1px solid #000;
          padding: 2px 5px;
        }
      `}</style>
    </div>
  );
}
