import { EarningsView } from "@/src/features/earnings/EarningsView";

export default function EarningsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Earnings</h1>
      <p className="text-sm text-muted mb-6">
        Your share of course and exam-prep program sales, and any payouts you&apos;ve requested.
      </p>
      <EarningsView />
    </div>
  );
}
