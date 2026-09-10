import { SessionsList } from "@/src/features/sessions/SessionsList";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Upcoming sessions</h1>
      <p className="text-sm text-muted mb-6">Your next classes and 1:1 sessions.</p>
      <SessionsList />
    </div>
  );
}
