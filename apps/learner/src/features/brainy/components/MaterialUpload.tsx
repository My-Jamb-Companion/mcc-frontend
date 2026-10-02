"use client";

import {useRef, useState} from "react";
import {extractApiError} from "@mcc/api";
import {Icon} from "@mcc/ui";
import {describeCharge} from "../helper/charge";
import {downscaleImage, isImageFile, MAX_UPLOAD_BYTES, UPLOAD_ACCEPT} from "../helper/imageUpload";
import {useUploadStudyMaterial} from "../hooks/useFlashcards";
import type {StudyMaterialResult} from "../services/flashcards.service";

// The backend caps photos itself; documents have no server limit, so stop an
// accidental 400 MB video before it is uploaded.
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

interface MaterialUploadProps {
  onExtracted: (result: StudyMaterialResult) => void;
}

/** Picks a PDF / Word / PowerPoint / text file or a photo and turns it into editable text. */
export default function MaterialUpload({onExtracted}: MaterialUploadProps) {
  const upload = useUploadStudyMaterial();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState<{name: string; chars: number; kind: StudyMaterialResult["kind"]; paid: string | null} | null>(null);
  const [reading, setReading] = useState<"photo" | "file" | null>(null);

  const handleFile = async (picked: File | undefined) => {
    if (!picked) return;
    setError(null);
    setDone(null);

    const image = isImageFile(picked);
    if (!image && picked.size > MAX_DOCUMENT_BYTES) {
      setError(`${picked.name} is too large (max ${MAX_DOCUMENT_BYTES / (1024 * 1024)} MB).`);
      return;
    }

    setReading(image ? "photo" : "file");
    try {
      const file = image ? await downscaleImage(picked) : picked;
      if (image && file.size > MAX_UPLOAD_BYTES) {
        setError("That photo is too large even after shrinking it. Try a screenshot or a smaller photo.");
        return;
      }
      const result = await upload.mutateAsync(file);
      setDone({name: result.filename, chars: result.text.length, kind: result.kind, paid: describeCharge(result.charge)});
      onExtracted(result);
    } catch (err) {
      setError(extractApiError(err, "Couldn't read that file. Please try another."));
    } finally {
      setReading(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const busy = reading !== null;

  return (
    <div className="mt-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-purple-400 bg-purple-50" : "border-muted/30 hover:border-purple-300"
        } ${busy ? "pointer-events-none opacity-70" : ""}`}
      >
        <Icon
          icon={busy ? "svg-spinners:180-ring-with-bg" : "ph:upload-simple"}
          size={28}
          className="text-purple-600"
        />
        <span className="text-sm font-medium text-gray-900">
          {reading === "photo"
            ? "Reading your photo…"
            : reading === "file"
              ? "Reading your file…"
              : "Drop a file here, or click to choose"}
        </span>
        <span className="text-xs text-gray-500">
          PDF, Word (.docx), PowerPoint (.pptx), text, or a photo of your notes
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={UPLOAD_ACCEPT}
          className="sr-only"
          disabled={busy}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </label>

      <p className="mt-2 text-xs text-gray-500">
        Audio and video files aren&apos;t supported yet. To use a lecture, try{" "}
        <span className="font-medium">Record</span> or paste a transcript. Photos use a little of
        your Brainy allowance; documents are free.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-green-600">
          <Icon icon="ph:check-circle" size={16} />
          Read {done.name} ({done.chars.toLocaleString()} characters
          {done.kind === "image" && done.paid ? ` · ${done.paid}` : ""}). Review the text below.
        </p>
      )}
    </div>
  );
}
