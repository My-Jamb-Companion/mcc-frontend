"use client";

import {useState} from "react";
import {extractApiError} from "@mcc/api";
import {Icon} from "@mcc/ui";
import {useGemPacks, usePurchaseGems} from "../hooks/useWallet";
import {formatNaira, parseGemAmount} from "../helper/wallet";

/** Buy gems with money: a few packs or any amount, then Flutterwave's hosted checkout. */
export default function BuyGems() {
  const {data: packs, isLoading, isError} = useGemPacks();
  const purchase = usePurchaseGems();
  const [selected, setSelected] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl bg-muted/10" />;
  if (isError || !packs) {
    return <p className="rounded-2xl border border-muted/25 p-4 text-sm text-subtle">Gem packs couldn&apos;t be loaded. Please refresh.</p>;
  }

  const customResult = parseGemAmount(custom, packs.custom);
  const usingCustom = custom.trim() !== "";
  const gems = usingCustom ? (customResult.ok ? customResult.gems : null) : selected;
  const total = gems ? gems * packs.naira_per_gem : 0;
  const customError = usingCustom && !customResult.ok ? customResult.error : null;

  const pay = () => {
    if (!gems) return;
    setError(null);
    purchase.mutate(gems, {
      onSuccess: (result) => {
        window.location.href = result.checkout_url;
      },
      onError: (err) => setError(extractApiError(err, "Couldn't start the payment. Please try again.")),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-subtle">
        1 gem = {formatNaira(packs.naira_per_gem)}. Bought gems can unlock courses; all gems pay for Brainy.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {packs.packs.map((pack) => {
          const active = !usingCustom && selected === pack.gems;
          return (
            <button
              key={pack.gems}
              type="button"
              onClick={() => { setSelected(pack.gems); setCustom(""); setError(null); }}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-4 transition-colors ${
                active ? "border-violet-600 bg-violet-50 dark:bg-violet-500/10" : "border-muted/30 hover:bg-muted/10"
              }`}
            >
              <Icon icon="ri:vip-diamond-fill" size={22} className="text-sky-500" />
              <span className="text-lg font-bold text-foreground">{pack.gems}</span>
              <span className="text-xs text-subtle">{formatNaira(pack.amount)}</span>
            </button>
          );
        })}
      </div>

      <div>
        <label htmlFor="custom-gems" className="mb-1 block text-xs font-medium text-subtle">Or a different amount</label>
        <input
          id="custom-gems"
          inputMode="numeric"
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setError(null); }}
          placeholder={`${packs.custom.min_gems} – ${packs.custom.max_gems.toLocaleString()} gems`}
          className="w-full rounded-xl border border-muted/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-violet-600 sm:max-w-xs"
        />
        {customError && <p className="mt-1 text-xs text-red-600">{customError}</p>}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={pay}
          disabled={!gems || purchase.isPending}
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
        >
          {purchase.isPending ? "Opening checkout…" : gems ? `Pay ${formatNaira(total)} for ${gems.toLocaleString()} gems` : "Choose an amount"}
        </button>
        <span className="text-xs text-subtle">Secure payment by Flutterwave. Your receipt is emailed to you.</span>
      </div>
    </div>
  );
}
