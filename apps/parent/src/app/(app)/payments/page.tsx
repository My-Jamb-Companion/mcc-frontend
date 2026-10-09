import { PaymentHistory } from "@/src/features/payments/PaymentHistory";

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Payments</h1>
      <p className="text-sm text-muted mb-6">Everything you&apos;ve paid for your children, with receipts.</p>
      <PaymentHistory />
    </div>
  );
}
