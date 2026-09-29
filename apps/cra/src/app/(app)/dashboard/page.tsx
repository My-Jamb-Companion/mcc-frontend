import { QueueList } from "@/src/features/queue/QueueList";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Your queue</h1>
      <p className="text-sm text-muted mb-6">
        Onboarding calls matched to you, waiting to be run.
      </p>
      <QueueList />
    </div>
  );
}
