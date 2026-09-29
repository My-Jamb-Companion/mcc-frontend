"use client";

import {useState} from "react";
import {Button, Modal, showSuccess} from "@mcc/ui";
import {useRequestReschedule} from "./hooks/useSessions";

function computeMinValue(): string {
  return new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);
}

interface RescheduleModalProps {
  sessionId: string | null;
  onClose: () => void;
}

function toIsoInstant(localValue: string): string | null {
  if (!localValue) return null;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function RescheduleModal({sessionId, onClose}: RescheduleModalProps) {
  const [value, setValue] = useState("");
  const requestReschedule = useRequestReschedule();

  // Computed once via lazy init, not on every render -- Date.now() is an
  // impure call React's purity rule (and a real hydration-mismatch risk)
  // disallows directly in render.
  const [minValue] = useState(computeMinValue);

  function handleClose() {
    setValue("");
    onClose();
  }

  function handleSubmit() {
    if (!sessionId) return;
    const iso = toIsoInstant(value);
    if (!iso) return;
    requestReschedule.mutate(
      {session_id: sessionId, proposed_time: iso},
      {
        onSuccess: (result) => {
          showSuccess(
            result.status === "auto_accommodated"
              ? "Session rescheduled"
              : "Reschedule requested -- your teacher's availability doesn't cover that time, so an admin will confirm a new slot with you.",
          );
          handleClose();
        },
      },
    );
  }

  return (
    <Modal open={!!sessionId} title="Request a reschedule" maxWidth="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Propose a new time for this session. If your teacher is free then, it&apos;s moved
          right away -- otherwise an admin will step in to confirm a new time with you.
        </p>

        <label className="block text-sm">
          <span className="mb-1 block text-muted">New date and time</span>
          <input
            type="datetime-local"
            value={value}
            min={minValue}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-muted/30 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" width="fit" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            width="fit"
            disabled={!value}
            loading={requestReschedule.isPending}
            onClick={handleSubmit}
          >
            Request reschedule
          </Button>
        </div>
      </div>
    </Modal>
  );
}
