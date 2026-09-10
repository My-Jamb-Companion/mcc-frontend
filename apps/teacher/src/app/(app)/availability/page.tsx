import { AvailabilityManager } from "@/src/features/availability/AvailabilityManager";

export default function AvailabilityPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Availability</h1>
      <p className="text-sm text-muted mb-6">
        Your recurring weekly hours — used to match you with new students.
      </p>
      <AvailabilityManager />
    </div>
  );
}
