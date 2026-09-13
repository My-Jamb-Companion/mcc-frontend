import { AvailabilityManager } from "@/src/features/availability/AvailabilityManager";
import { ComponentStep } from "../types/formTypes";

export function AvailabilityStepRenderer({ step: _step }: { step: ComponentStep }) {
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
