"use client";

import { FormInputs, useForm } from "@mcc/features";
import { Button } from "@mcc/ui";
import { useEarnings, usePayouts, useRequestPayout } from "./useEarnings";
import type { PayoutRequest } from "./earnings.service";

const formatNaira = (amount: string) => `₦${Number(amount).toLocaleString()}`;

const formatWhen = (iso: string) => new Date(iso).toLocaleString();

const STATUS_STYLE: Record<PayoutRequest["status"], string> = {
  pending: "text-primary",
  approved: "text-success",
  rejected: "text-danger",
};

interface PayoutFormInputs {
  amount: string;
}

export const EarningsView = () => {
  const { data: earnings, isLoading: earningsLoading } = useEarnings();
  const { data: payouts, isLoading: payoutsLoading } = usePayouts();
  const requestPayout = useRequestPayout();
  const { register, handleSubmit, formState, reset } = useForm<PayoutFormInputs>();

  const balance = earnings ? Number(earnings.balance) : 0;

  const onSubmit = (data: PayoutFormInputs) => {
    requestPayout.mutate(data.amount, { onSuccess: () => reset() });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-muted/20 p-6">
        <p className="text-sm text-muted">Available balance</p>
        <p className="text-3xl font-semibold mt-1">
          {earningsLoading ? "…" : formatNaira(earnings?.balance ?? "0")}
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
          Request a payout
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end rounded-lg border border-muted/20 p-4"
        >
          <FormInputs
            label="Amount"
            type="number"
            placeholder="0.00"
            registration={register("amount", {
              required: "Required",
              validate: (value) => {
                const amount = Number(value);
                if (!(amount > 0)) return "Must be greater than zero";
                if (amount > balance) return "Exceeds your available balance";
                return true;
              },
            })}
            errors={formState.errors.amount}
            inputProps={{ step: "0.01", min: "0" }}
          />
          <Button
            type="submit"
            loading={requestPayout.isPending}
            disabled={balance <= 0}
          >
            Request payout
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
          Payout requests
        </h2>
        {payoutsLoading && <p className="text-sm text-muted">Loading…</p>}
        {payouts && payouts.length === 0 && (
          <p className="text-sm text-muted">No payout requests yet.</p>
        )}
        {payouts && payouts.length > 0 && (
          <ul className="space-y-2">
            {payouts.map((payout) => (
              <li
                key={payout.id}
                className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{formatNaira(payout.amount)}</p>
                  <p className="text-xs text-muted">{formatWhen(payout.requested_at)}</p>
                  {payout.notes && <p className="text-xs text-muted mt-1">{payout.notes}</p>}
                </div>
                <span className={`text-sm font-medium capitalize ${STATUS_STYLE[payout.status]}`}>
                  {payout.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
          Recent activity
        </h2>
        {earnings && earnings.transactions.length === 0 && (
          <p className="text-sm text-muted">No activity yet.</p>
        )}
        {earnings && earnings.transactions.length > 0 && (
          <ul className="space-y-2">
            {earnings.transactions.map((txn) => (
              <li
                key={txn.id}
                className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{txn.description || txn.type}</p>
                  <p className="text-xs text-muted">{formatWhen(txn.created_at)}</p>
                </div>
                <span
                  className={`text-sm font-medium ${Number(txn.amount) < 0 ? "text-danger" : "text-success"}`}
                >
                  {Number(txn.amount) < 0 ? "" : "+"}
                  {formatNaira(txn.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
