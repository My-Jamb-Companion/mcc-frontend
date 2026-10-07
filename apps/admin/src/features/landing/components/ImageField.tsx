"use client";

import {useRef, useState} from "react";
import {Icon, showError} from "@mcc/ui";
import {uploadMedia} from "@/src/features/courses/services/media.service";

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 3 * 1024 * 1024;

/** Pick or upload an image for a block. Uploads go to the "landing" folder and the field keeps the public address. */
export default function ImageField({label, help, value, onChange, disabled}: {
  label: string; help?: string; value: string; onChange: (url: string) => void; disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return showError("Please choose a PNG, JPG, WebP or GIF image.");
    if (file.size > MAX_BYTES) return showError("That image is over 3 MB. Please choose a smaller one.");
    setBusy(true);
    setProgress(0);
    try {
      onChange(await uploadMedia(file, "landing", setProgress));
    } catch {
      showError("The image couldn't be uploaded. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 p-3">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-300">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon icon="lucide:image" size={22} />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => input.current?.click()}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {busy ? `Uploading ${progress}%` : value ? "Replace image" : "Upload image"}
            </button>
            {value && !busy && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("")}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">PNG, JPG, WebP or GIF, up to 3 MB.</p>
        </div>
        <input ref={input} type="file" accept={ACCEPT.join(",")} aria-label={label} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {help && <p className="text-xs text-gray-400">{help}</p>}
    </div>
  );
}
