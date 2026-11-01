"use client";

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {Icon, showError, showSuccess} from "@mcc/ui";
import {useDebouncedValue} from "@/src/features/students/hooks/useDebouncedValue";
import {useDeleteLibraryImages, useImageLibrary} from "../hooks/useImageLibrary";
import {deleteMessage, duplicatesToRemove, formatSize, formatUploaded} from "../helper/imageLibrary";

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
  const remove = useDeleteLibraryImages();
  // "Tidy up": tiles are ticked instead of inserted, so pictures can be deleted.
  const [tidying, setTidying] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);

  // Each time it opens it starts on the library, with an empty search.
  useEffect(() => {
    if (open) {
      setTab("library");
      setSearch("");
      setTidying(false);
      setSelected(new Set());
      setConfirming(false);
    }
  }, [open]);

  function toggle(url: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function stopTidying() {
    setTidying(false);
    setSelected(new Set());
    setConfirming(false);
  }

  function deleteSelected() {
    remove.mutate([...selected], {
      onSuccess: (result) => {
        showSuccess(deleteMessage(result.deleted, result.skipped.length));
        setSelected(new Set());
        setConfirming(false);
      },
      onError: () => {
        showError("Couldn't delete the images. Please try again.");
        setConfirming(false);
      },
    });
  }

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
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by file name"
                aria-label="Search images"
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
              {library.images.length > 0 && (
                <button
                  type="button"
                  onClick={() => (tidying ? stopTidying() : setTidying(true))}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-medium ${tidying ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  {tidying ? "Done" : "Tidy up"}
                </button>
              )}
            </div>
            {tidying && <p className="text-xs text-gray-500">Tick the pictures to delete. A picture a lesson uses can&apos;t be deleted.</p>}
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
                    {library.images.map((image) => {
                      const locked = tidying && image.used_in > 0;
                      const ticked = selected.has(image.url);
                      return (
                        <li key={image.url}>
                          <button
                            type="button"
                            disabled={locked}
                            aria-pressed={tidying ? ticked : undefined}
                            onClick={() => (tidying ? toggle(image.url) : onPick(image.url))}
                            title={locked ? `${image.name}: used in ${image.used_in} ${image.used_in === 1 ? "lesson" : "lessons"}` : image.name}
                            className={`group flex w-full flex-col overflow-hidden rounded-xl border text-left focus-visible:border-violet-500 ${
                              ticked ? "border-violet-600 ring-2 ring-violet-300" : "border-gray-200 hover:border-violet-400"
                            } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <span className="relative block w-full bg-gray-100" style={{aspectRatio: "4 / 3"}}>
                              <img src={image.url} alt={image.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                              {tidying && !locked && (
                                <span className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border-2 ${ticked ? "border-violet-600 bg-violet-600 text-white" : "border-white bg-white/80"}`}>
                                  {ticked && <Icon icon="lucide:check" size={12} />}
                                </span>
                              )}
                              {tidying && locked && (
                                <span className="absolute left-2 top-2 rounded-md bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                  Used in {image.used_in}
                                </span>
                              )}
                            </span>
                            <span className="flex flex-col px-2 py-1.5">
                              <span className="truncate text-xs font-medium text-gray-800">{image.name}</span>
                              <span className="truncate text-[11px] text-gray-500">{formatSize(image.size_bytes)} · {formatUploaded(image.uploaded_at)}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
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
            {tidying && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                {confirming ? (
                  <>
                    <p className="text-sm text-gray-700">Delete {selected.size} {selected.size === 1 ? "image" : "images"} for good? This can&apos;t be undone.</p>
                    <div className="flex gap-2">
                      <button type="button" disabled={remove.isPending} onClick={() => setConfirming(false)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Keep them</button>
                      <button type="button" disabled={remove.isPending} onClick={deleteSelected} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                        {remove.isPending ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSelected(new Set(duplicatesToRemove(library.images)))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Select duplicates</button>
                      {selected.size > 0 && <button type="button" onClick={() => setSelected(new Set())} className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">Clear</button>}
                    </div>
                    <button type="button" disabled={selected.size === 0} onClick={() => setConfirming(true)} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40">
                      Delete{selected.size > 0 ? ` ${selected.size}` : ""}
                    </button>
                  </>
                )}
              </div>
            )}
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
