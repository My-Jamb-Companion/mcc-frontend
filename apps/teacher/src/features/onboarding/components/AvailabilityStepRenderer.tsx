import { Icon } from "@mcc/ui";
import { AvailabilityManager } from "@/src/features/availability/AvailabilityManager";
import { ComponentStep } from "../types/formTypes";

export function AvailabilityStepRenderer({
  step: _step,
  preview,
}: {
  step: ComponentStep;
  preview: boolean;
}) {
  if (preview) {
    return (
      <div className="rounded-lg border border-dashed border-muted/40 p-6 text-center text-sm text-muted">
        <Icon icon="mdi:calendar-clock-outline" size={32} className="mx-auto mb-2" />
        Preview mode — with a real account, you&apos;d add your real weekly availability
        here and it would sync live with the scheduling system.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted text-center">
        Add at least one weekly time slot so students can book sessions with you.
        You can always add more later from the Availability tab.
      </p>
      <AvailabilityManager />
    </div>
  );
}
