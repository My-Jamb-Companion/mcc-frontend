"use client";

import {useEffect, useRef, useState} from "react";
import {Modal} from "@mcc/ui";
import {extractApiError} from "@mcc/api";

interface NameDialogProps {
  title: string;
  label: string;
  initialValue?: string;
  submitLabel: string;
  maxLength: number;
  /** Rejecting shows the message inline and keeps the dialog open, e.g. "name already taken". */
  onSubmit: (value: string) => Promise<void>;
  onClose: () => void;
}

/**
 * One small "type a name" dialog, shared by rename chat, new group and rename
 * group. Mount it only while it should be visible: it seeds its field from
 * `initialValue` on mount, so each open starts fresh.
 */
export default function NameDialog({
  title,
  label,
  initialValue = "",
  submitLabel,
  maxLength,
  onSubmit,
  onClose,
}: NameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Not `autoFocus`: the shared Modal moves focus to its own panel after it
  // mounts, which wins over the input's. This effect runs after Modal's.
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const trimmed = value.trim();
  const unchanged = trimmed === initialValue.trim();
  const canSubmit = !!trimmed && !unchanged && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(extractApiError(err, "Something went wrong. Please try again."));
      setSaving(false);
    }
  };

  return (
    <Modal open title={title} maxWidth="max-w-sm">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="brainy-name-dialog" className="text-sm font-medium">
            {label}
          </label>
          <input
            id="brainy-name-dialog"
            ref={inputRef}
            value={value}
            maxLength={maxLength}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            className="w-full rounded-lg border border-muted/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && (
            <p role="alert" className="text-xs text-red-500">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
