"use client";

import { useState } from "react";
import { Button, Modal, showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useMuteUser } from "./hooks/useModeration";
import { MUTE_DURATIONS } from "./reportCopy";

/** Mute someone from posting in course discussions. They can still read, delete their own posts and report. */
export function MuteModal({ userId, userName, onClose }: { userId: string | null; userName?: string | null; onClose: () => void }) {
  const mute = useMuteUser();
  const [days, setDays] = useState<number | null>(7);
  const [reason, setReason] = useState("");

  const close = () => {
    setReason("");
    setDays(7);
    onClose();
  };

  const submit = () => {
    if (!userId || reason.trim().length < 3) return;
    mute.mutate(
      { user_id: userId, reason: reason.trim(), days },
      {
        onSuccess: () => {
          showSuccess(`${userName || "The author"} is muted and has been told why`);
          close();
        },
        onError: (error) => showError(extractApiError(error, "Couldn't mute them")),
      },
    );
  };

  return (
    <Modal open={!!userId} title={`Mute ${userName || "this person"}?`} maxWidth="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm text-neutral-500">
          They won&apos;t be able to post in any course discussion. They can still read, delete their own posts and report.
          They&apos;ll see your reason.
        </p>
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">For how long</span>
          <select
            value={days ?? ""}
            onChange={(e) => setDays(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          >
            {MUTE_DURATIONS.map((d) => (
              <option key={d.label} value={d.days ?? ""}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Reason (shown to them)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            placeholder="e.g. Repeated posts that weren't about the course"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" width="fit" onClick={close}>
            Cancel
          </Button>
          <Button type="button" width="fit" disabled={reason.trim().length < 3} loading={mute.isPending} onClick={submit}>
            Mute
          </Button>
        </div>
      </div>
    </Modal>
  );
}
