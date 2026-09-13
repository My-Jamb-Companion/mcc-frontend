"use client";

import { useState } from "react";
import { Icon } from "@mcc/ui";
import { FileField } from "../types/formTypes";

// Mocked: no backend endpoint accepts a real upload for any of these fields
// (see backend/docs/teacher-onboarding-backend-todo.md). The RHF/localStorage
// value is the filename string, never the File object -- Files aren't
// JSON-serializable. The object-URL preview is session-local only and is
// intentionally lost on refresh.
export function FileUploadField({
  field,
  value,
  onChange,
}: {
  field: FileField;
  value: string;
  onChange: (filename: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onChange(file.name);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange("");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-start text-sm">{field.question}</label>
      {value ? (
        <div className="flex items-center justify-between rounded-md border border-muted/20 p-2 text-sm">
          <span className="flex items-center gap-2 truncate">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-8 w-8 rounded object-cover" />
            ) : (
              <Icon icon="mdi:file-document-outline" size={20} />
            )}
            <span className="truncate">{value}</span>
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-muted hover:text-danger shrink-0"
          >
            <Icon icon="mdi:close" size={18} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-muted/40 p-4 text-sm text-muted cursor-pointer hover:border-btn-primary hover:text-btn-primary transition-colors">
          <Icon icon="mdi:upload" size={18} />
          Choose file
          <input
            type="file"
            accept={field.accept}
            onChange={handleChange}
            className="hidden"
          />
        </label>
      )}
      {field.helpText && <p className="text-xs text-muted">{field.helpText}</p>}
    </div>
  );
}
