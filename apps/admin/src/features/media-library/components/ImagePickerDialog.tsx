"use client";

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {Icon} from "@mcc/ui";
import {useDebouncedValue} from "@/src/features/students/hooks/useDebouncedValue";
import {useImageLibrary} from "../hooks/useImageLibrary";
import {formatSize, formatUploaded} from "../helper/imageLibrary";

type Tab = "library" | "upload";

/**
 * "Insert an image" for the lesson editor: pick one that was uploaded before, or upload a new one. It is drawn straight
 * onto the page (above the editor's own pop-up), and nothing is fetched until it is opened.
 */
export default function ImagePickerDialog({open, uploading, onClose, onPick, onUpload}: {
  open: boolean;
  uploading: boolean;
  onClose: () => void;
  /** An image from the library was chosen. */
  onPick: (url: string) => void;
  /** A new file was chosen to upload. */
  onUpload: (file: File) => void;
}) {
  const [tab, setTab] = useState<Tab>("library");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim());
  const library = useImageLibrary(debounced, open);
  const fileInput = useRef<HTMLInputElement>(null);

  // Each time it opens it starts on the library, with an empty search.
  useEffect(() => {
    if (open) {
      setTab("library");
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const tabClass = (on: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium ${on ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Insert an image"
        className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Insert an image</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <Icon icon="lucide:x" size={18} />
          </button>
        </div>

        <div className="flex gap-1" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "library"} className={tabClass(tab === "library")} onClick={() => setTab("library")}>
            Already uploaded{library.total > 0 ? ` (${library.total})` : ""}
          </button>
          <button type="button" role="tab" aria-selected={tab === "upload"} className={tabClass(tab === "upload")} onClick={() => setTab("upload")}>
            Upload a new one
          </button>
        </div>

        {tab === "library" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file name"
              aria-label="Search images"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
            <div className="min-h-[200px] overflow-y-auto">
              {library.isLoading ? (
                <p className="py-10 text-center text-sm text-gray-500">Loading your images…</p>
              ) : library.isError ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-gray-500">
                  <p>The image library couldn&apos;t be loaded.</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => library.refetch()} className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50">Try again</button>
                    <button type="button" onClick={() => setTab("upload")} className="rounded-lg bg-violet-600 px-3 py-1.5 font-medium text-white hover:bg-violet-700">Upload a new one</button>
                  </div>
                </div>
              ) : library.images.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-gray-500">
                  <p>{debounced ? `No image matches “${debounced}”.` : "Nothing has been uploaded yet."}</p>
                  <button type="button" onClick={() => setTab("upload")} className="rounded-lg bg-violet-600 px-3 py-1.5 font-medium text-white hover:bg-violet-700">Upload a new one</button>
                </div>
              ) : (
                <>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {library.images.map((image) => (
                      <li key={image.url}>
                        <button
                          type="button"
                          onClick={() => onPick(image.url)}
                          title={image.name}
                          className="group flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 text-left hover:border-violet-400 focus-visible:border-violet-500"
                        >
                          <span className="relative block w-full bg-gray-100" style={{aspectRatio: "4 / 3"}}>
                            <img src={image.url} alt={image.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                          </span>
                          <span className="flex flex-col px-2 py-1.5">
                            <span className="truncate text-xs font-medium text-gray-800">{image.name}</span>
                            <span className="truncate text-[11px] text-gray-400">{formatSize(image.size_bytes)} · {formatUploaded(image.uploaded_at)}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {library.hasMore && (
                    <div className="flex justify-center py-3">
                      <button type="button" disabled={library.loadingMore} onClick={() => library.loadMore()} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        {library.loadingMore ? "Loading…" : "Show more"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
            <Icon icon="lucide:image-plus" size={28} className="text-violet-500" />
            <p className="text-sm text-gray-600">Choose an image from your device. It&apos;s added to your library, so you can reuse it in other lessons.</p>
            <button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
              {uploading ? "Uploading…" : "Choose a file"}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              aria-label="Choose an image file"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onUpload(file);
              }}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
