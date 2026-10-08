"use client";

import {useState} from "react";
import {extractApiError} from "@mcc/api";
import {Icon, showError, showSuccess} from "@mcc/ui";
import {useConvertCurrency} from "../hooks/useWallet";
import {CONVERSIONS, CURRENCY_LABEL, planConversion} from "../helper/wallet";
import {ApiWalletBalance} from "../services/wallet.service";

/** Convert points or silver into gems (or back) with a live preview of what will really change hands. */
export default function ConvertPanel({balance}: {balance?: ApiWalletBalance}) {
  const convert = useConvertCurrency();
  const [index, setIndex] = useState(0);
  const [amount, setAmount] = useState("");

  const conversion = CONVERSIONS[index];
  const have = balance?.[conversion.from] ?? 0;
  const value = Number(amount);
  const plan = planConversion(conversion, value, have);
  const ready = plan.received > 0 && !plan.problem;

  const submit = () => {
    convert.mutate(
      {from: conversion.from, to: conversion.to, amount: value},
      {
        onSuccess: (result) => {
          showSuccess(`Converted ${result.amount_spent.toLocaleString()} ${CURRENCY_LABEL[conversion.from]} into ${result.amount_received.toLocaleString()} ${CURRENCY_LABEL[conversion.to]}.`);
          setAmount("");
        },
        onError: (err) => showError(extractApiError(err, "Couldn't convert. Please try again.")),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Convert">
        {CONVERSIONS.map((c, i) => (
          <button
            key={`${c.from}-${c.to}`}
            type="button"
            aria-pressed={i === index}
            onClick={() => { setIndex(i); setAmount(""); }}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              i === index ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-500/10" : "border-muted/30 text-subtle hover:bg-muted/10"
            }`}
          >
            {c.from}
            <Icon icon="solar:arrow-right-linear" size={12} />
            {c.to}
          </button>
        ))}
      </div>

      <p className="text-sm text-subtle">
        {conversion.give.toLocaleString()} {CURRENCY_LABEL[conversion.from]} = {conversion.get.toLocaleString()} {CURRENCY_LABEL[conversion.to]}.
        You have <strong className="text-foreground">{have.toLocaleString()}</strong> {CURRENCY_LABEL[conversion.from]}.
      </p>

      <div>
        <label htmlFor="convert-amount" className="mb-1 block text-xs font-medium text-subtle">
          How many {CURRENCY_LABEL[conversion.from]}?
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="convert-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full rounded-xl border border-muted/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-violet-600 sm:max-w-xs"
          />
          <button
            type="button"
            onClick={() => setAmount(String(have))}
            className="rounded-full border border-muted/30 px-3 py-1.5 text-xs font-medium text-subtle hover:bg-muted/10"
          >
            Use all
          </button>
        </div>
      </div>

      <div className="min-h-12 rounded-2xl bg-muted/5 p-3 text-sm" aria-live="polite">
        {plan.problem ? (
          <p className="text-amber-700 dark:text-amber-500">{plan.problem}</p>
        ) : ready ? (
          <>
            <p className="text-foreground">
              You&apos;ll receive <strong>{plan.received.toLocaleString()} {CURRENCY_LABEL[conversion.to]}</strong> for{" "}
              {plan.spent.toLocaleString()} {CURRENCY_LABEL[conversion.from]}.
            </p>
            {plan.unused > 0 && (
              <p className="mt-1 text-xs text-subtle">
                {plan.unused.toLocaleString()} {CURRENCY_LABEL[conversion.from]} stay in your wallet — only whole units convert.
              </p>
            )}
          </>
        ) : (
          <p className="text-subtle">Enter an amount to see what you&apos;d get.</p>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={submit}
          disabled={!ready || convert.isPending}
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
        >
          {convert.isPending ? "Converting…" : "Convert"}
        </button>
      </div>
    </div>
  );
}
