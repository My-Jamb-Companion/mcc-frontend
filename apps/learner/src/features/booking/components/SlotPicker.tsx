"use client";

import {useState} from "react";
import {Button, showSuccess} from "@mcc/ui";
import {useSelectSlot} from "../hooks/useAssignment";

interface SlotPickerProps {
  purpose: "course" | "exam";
  targetId: string;
}

/** Local datetime-local input value ("2026-10-05T14:30") -> a real ISO
 * 8601 instant, so the browser's own timezone doesn't get lost on the way
 * to the backend (which just needs "must be in the future", not any
 * particular zone). */
function toIsoInstant(localValue: string): string | null {
  if (!localValue) return null;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function computeMinValue(): string {
  return new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);
}

export function SlotPicker({purpose, targetId}: SlotPickerProps) {
  const [value, setValue] = useState("");
  const selectSlot = useSelectSlot();

  // Computed once via lazy init, not on every render -- Date.now() is an
  // impure call React's purity rule (and a real hydration-mismatch risk)
  // disallows directly in render.
  const [minValue] = useState(computeMinValue);

  function handleBook() {
    const iso = toIsoInstant(value);
    if (!iso) return;
    selectSlot.mutate(
      {purpose, target_id: targetId, scheduled_at: iso},
      {onSuccess: () => showSuccess("Your onboarding call is booked")},
    );
  }

  return (
    <div className="rounded-2xl border border-muted/20 bg-muted/5 p-4 sm:p-6">
      <p className="font-semibold text-foreground">Book your onboarding call</p>
      <p className="mt-1 text-sm text-muted">
        Before you dive in, a course coordinator will walk you through the platform on a
        short video call and help you settle on a weekly time for your 1:1 teacher sessions.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm">
          <span className="mb-1 block text-muted">Pick a date and time</span>
          <input
            type="datetime-local"
            value={value}
            min={minValue}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-muted/30 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </label>
        <Button
          variant="primary"
          width="fit"
          disabled={!value}
          loading={selectSlot.isPending}
          onClick={handleBook}
        >
          Book call
        </Button>
      </div>
    </div>
  );
}
