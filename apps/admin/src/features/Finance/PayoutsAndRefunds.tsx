"use client";

import { useState } from "react";
import { ConfirmModal, Icon, showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import {
  useApprovePayout,
  usePayments,
  usePayouts,
  useRefundPayment,
  useRejectPayout,
} from "./hooks/useFinance";
import type { ApiPaymentIntent, ApiPayoutRequest } from "./services/finance.service";

const formatCurrency = (amount: number | string) =>
  `₦${new Intl.NumberFormat("en-US").format(Number(amount))}`;

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function StatusTag({ status }: { status: string }) {
  const style: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600",
    successful: "bg-green-50 text-green-600",
    approved: "bg-green-50 text-green-600",
    failed: "bg-red-50 text-red-600",
    rejected: "bg-red-50 text-red-600",
    refunded: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function PillButton({
  label,
  variant = "outline",
  loading,
  onClick,
}: {
  label: string;
  variant?: "outline" | "primary" | "danger";
  loading?: boolean;
  onClick?: () => void;
}) {
  const variantClass =
    variant === "primary"
      ? "bg-violet-600 text-white hover:bg-violet-700"
      : variant === "danger"
        ? "border border-red-200 text-red-600 hover:bg-red-50"
        : "border border-gray-200 text-gray-800 hover:bg-gray-50";
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${variantClass}`}
    >
      {loading ? "…" : label}
    </button>
  );
}

function PayoutRow({ payout }: { payout: ApiPayoutRequest }) {
  const approve = useApprovePayout();
  const reject = useRejectPayout();

  const handleApprove = () => {
    approve.mutate(
      { id: payout.id },
      {
        onSuccess: () => showSuccess("Payout approved"),
        onError: (error) => showError(extractApiError(error, "Couldn't approve this payout")),
      },
    );
  };

  const handleReject = () => {
    reject.mutate(
      { id: payout.id },
      {
        onSuccess: () => showSuccess("Payout rejected, balance credited back"),
        onError: (error) => showError(extractApiError(error, "Couldn't reject this payout")),
      },
    );
  };

  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-neutral-900">{formatCurrency(payout.amount)}</div>
        <div className="text-xs text-neutral-400 mt-0.5">
          Teacher {payout.teacher_id.slice(0, 8)}… · {formatWhen(payout.requested_at)}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusTag status={payout.status} />
        {payout.status === "pending" && (
          <>
            <ConfirmModal
              title="Approve payout"
              description="Confirm you've paid this teacher outside the system (bank transfer, etc). This records the payout as complete."
              confirmText="Approve"
              variant="default"
              onConfirm={handleApprove}
              trigger={<PillButton label="Approve" variant="primary" loading={approve.isPending} />}
            />
            <ConfirmModal
              title="Reject payout"
              description="The requested amount will be credited back to the teacher's earnings balance."
              confirmText="Reject"
              variant="danger"
              onConfirm={handleReject}
              trigger={<PillButton label="Reject" variant="danger" loading={reject.isPending} />}
            />
          </>
        )}
      </div>
    </div>
  );
}

function PaymentRow({ payment }: { payment: ApiPaymentIntent }) {
  const refund = useRefundPayment();

  const handleRefund = () => {
    refund.mutate(payment.tx_ref, {
      onSuccess: () => showSuccess("Payment refunded"),
      onError: (error) => showError(extractApiError(error, "Couldn't refund this payment")),
    });
  };

  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-neutral-900">{formatCurrency(payment.amount)}</div>
        <div className="text-xs text-neutral-400 mt-0.5 capitalize">
          {payment.purpose.replace("_", " ")} · {formatWhen(payment.created_at)}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusTag status={payment.status} />
        {payment.status === "successful" && (
          <ConfirmModal
            title="Refund payment"
            description="Confirm you've refunded the payer outside the system. This revokes the enrollment or exam-program access and reverses any teacher earnings from the sale."
            confirmText="Refund"
            variant="danger"
            onConfirm={handleRefund}
            trigger={<PillButton label="Refund" variant="danger" loading={refund.isPending} />}
          />
        )}
      </div>
    </div>
  );
}

export function PayoutsAndRefunds() {
  const [activeTab, setActiveTab] = useState<"Payouts" | "Payments">("Payouts");
  const { data: payouts, isLoading: payoutsLoading } = usePayouts();
  const { data: payments, isLoading: paymentsLoading } = usePayments();

  const pendingCount = payouts?.filter((p) => p.status === "pending").length ?? 0;

  return (
    <div className="w-full rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900">Payouts &amp; Refunds</h3>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
            <Icon icon="mdi:clock-outline" size={14} />
            {pendingCount} pending payout{pendingCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mt-4 mb-2 inline-flex items-center rounded-xl bg-neutral-100/80 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("Payouts")}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
            activeTab === "Payouts" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Payout requests
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("Payments")}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
            activeTab === "Payments" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Payments
        </button>
      </div>

      {activeTab === "Payouts" && (
        <div className="divide-y divide-gray-100">
          {payoutsLoading && <p className="py-6 text-sm text-neutral-400">Loading…</p>}
          {payouts && payouts.length === 0 && (
            <p className="py-6 text-sm text-neutral-400">No payout requests yet.</p>
          )}
          {payouts?.map((payout) => <PayoutRow key={payout.id} payout={payout} />)}
        </div>
      )}

      {activeTab === "Payments" && (
        <div className="divide-y divide-gray-100">
          {paymentsLoading && <p className="py-6 text-sm text-neutral-400">Loading…</p>}
          {payments && payments.length === 0 && (
            <p className="py-6 text-sm text-neutral-400">No payments yet.</p>
          )}
          {payments?.map((payment) => <PaymentRow key={payment.tx_ref} payment={payment} />)}
        </div>
      )}
    </div>
  );
}

export default PayoutsAndRefunds;
