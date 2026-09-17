import { SessionsList } from "@/src/features/sessions/SessionsList";
import { SessionsToConfirm } from "@/src/features/sessions/SessionsToConfirm";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-semibold mb-1">Upcoming sessions</h1>
        <p className="text-sm text-muted mb-6">Your next classes and 1:1 sessions.</p>
        <SessionsList />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-1">Confirm delivered sessions</h2>
        <p className="text-sm text-muted mb-6">
          You&apos;re paid for each session you deliver. Mark a session delivered once it has taken place and its
          pay is added to your earnings.
        </p>
        <SessionsToConfirm />
      </section>
    </div>
  );
}
