"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100" />,
});

// The H2 button is load-bearing, not decorative: the student-side viewer
// (apps/learner/.../InteractiveLessonContent.tsx) splits a lesson into
// one-block-per-heading pages by looking for top-level <h2> elements in
// this HTML.
const LESSON_EDITOR_MODULES = {
  toolbar: [
    [{header: [2, false]}],
    ["bold", "italic", "underline", "strike"],
    [{list: "ordered"}, {list: "bullet"}],
    ["link"],
    ["clean"],
  ],
};

export default function LessonHtmlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  return (
    <div className="lesson-html-editor-wrapper rounded-xl border border-gray-200 bg-white overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={LESSON_EDITOR_MODULES}
        placeholder="Write the lesson content. Use Heading 2 to start a new block -- students will see one block at a time."
      />

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
      `}</style>
    </div>
  );
}
