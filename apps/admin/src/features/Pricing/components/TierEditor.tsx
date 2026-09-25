"use client";

import {useMemo, useState} from "react";
import {showSuccess} from "@mcc/ui";
import {fractionToPct, pctToFraction} from "../helper/pricingForm";
import {useSaveTierSet, useTierSet} from "../hooks/useLocations";
import type {ApiTierSet} from "../services/locations.service";
import {pricingErrorMessage} from "../services/pricing.service";
import {Section} from "./Fields";

interface TierRow {
  tier_id: string;
  name: string;
  multiplier: string;
  sharePct: string;
  is_default: boolean;
}

const DECIMAL = /^\d+(\.\d+)?$/;
const decimals = (s: string) => (s.split(".")[1] ?? "").length;

export default function TierEditor() {
  const {data, isLoading, isError, error, refetch} = useTierSet();

  return (
    <Section
      title="Purchasing-power tiers"
      description="Each tier's multiplier scales only the part of a price above its hard floor — development, overheads and profit — so no tier can sell below cost. 1.00 is full cost; below 1 is a discount, above 1 a premium. A buyer picks a tier directly at checkout."
    >
      {isLoading ? (
        <p className="text-sm text-neutral-400">Loading tiers…</p>
      ) : isError || !data ? (
        <p className="text-sm text-red-600">
          {pricingErrorMessage(error, "Couldn't load the tiers.")}{" "}
          <button type="button" className="font-semibold underline" onClick={() => refetch()}>
            Try again
          </button>
        </p>
      ) : (
        <TierForm key={data.revision} tierSet={data} onReload={() => refetch()} />
      )}
    </Section>
  );
}

function TierForm({tierSet, onReload}: {tierSet: ApiTierSet; onReload: () => void}) {
  const [rows, setRows] = useState<TierRow[]>(() =>
    tierSet.tiers.map((t) => ({
      tier_id: t.tier_id,
      name: t.name,
      multiplier: String(Number(t.multiplier)),
      sharePct: fractionToPct(t.expected_sales_share),
      is_default: t.is_default,
    })),
  );
  const [reason, setReason] = useState("");
  const [belowCostReason, setBelowCostReason] = useState("");
  const [saveError, setSaveError] = useState<{message: string; conflict: boolean} | null>(null);
  const save = useSaveTierSet();

  const update = (tierId: string, patch: Partial<TierRow>) =>
    setRows((prev) => prev.map((r) => (r.tier_id === tierId ? {...r, ...patch} : r)));

  const rowErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    rows.forEach((r) => {
      if (!r.name.trim()) errors[r.tier_id] = "Name the tier";
      else if (!DECIMAL.test(r.multiplier) || Number(r.multiplier) <= 0 || Number(r.multiplier) > 5 || decimals(r.multiplier) > 3)
        errors[r.tier_id] = "Multiplier must be above 0 and at most 5, up to 3 decimals";
      else if (!DECIMAL.test(r.sharePct) || Number(r.sharePct) > 100 || decimals(r.sharePct) > 3)
        errors[r.tier_id] = "Share must be a percentage between 0 and 100";
    });
    return errors;
  }, [rows]);

  const totalShare = rows.reduce((sum, r) => sum + (DECIMAL.test(r.sharePct) ? Number(r.sharePct) : 0), 0);
  const sharesOk = Math.abs(totalShare - 100) <= 0.01;
  const weighted =
    totalShare > 0
      ? rows.reduce((sum, r) => sum + (Number(r.multiplier) || 0) * (Number(r.sharePct) || 0), 0) / totalShare
      : 0;
  const funded = weighted >= 1;
  const hasErrors = Object.keys(rowErrors).length > 0 || !sharesOk;

  const unchanged =
    rows.every((r) => {
      const t = tierSet.tiers.find((x) => x.tier_id === r.tier_id)!;
      return (
        r.name.trim() === t.name &&
        Number(r.multiplier) === Number(t.multiplier) &&
        pctToFraction(r.sharePct) === pctToFraction(fractionToPct(t.expected_sales_share)) &&
        r.is_default === t.is_default
      );
    });

  const handleSave = () => {
    setSaveError(null);
    if (hasErrors) {
      setSaveError({message: "Fix the highlighted tiers first.", conflict: false});
      return;
    }
    if (reason.trim().length < 3) {
      setSaveError({message: "Say briefly why the tiers are changing.", conflict: false});
      return;
    }
    if (!funded && belowCostReason.trim().length < 3) {
      setSaveError({message: "Record why under-recovering costs is deliberate.", conflict: false});
      return;
    }
    save.mutate(
      {
        revision: tierSet.revision,
        change_reason: reason.trim(),
        below_cost_reason: funded ? null : belowCostReason.trim(),
        tiers: rows.map((r) => ({
          tier_id: r.tier_id,
          name: r.name.trim(),
          multiplier: r.multiplier,
          expected_sales_share: pctToFraction(r.sharePct),
          is_default: r.is_default,
        })),
      },
      {
        onSuccess: () => showSuccess("Tiers saved"),
        onError: (err) => {
          const status = (err as {response?: {status?: number}})?.response?.status;
          setSaveError({message: pricingErrorMessage(err, "Couldn't save the tiers."), conflict: status === 409});
        },
      },
    );
  };

  const input = "w-full rounded-lg border border-neutral-200 px-2.5 py-2 text-sm tabular-nums outline-none focus:border-violet-500";

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-neutral-400">
              <th className="pb-2 pr-3 font-medium">Tier</th>
              <th className="pb-2 pr-3 font-medium">Multiplier</th>
              <th className="pb-2 pr-3 font-medium">Expected share of sales</th>
              <th className="pb-2 font-medium">Default</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.tier_id} className="align-top">
                <td className="py-1.5 pr-3">
                  <input aria-label="Tier name" value={r.name} onChange={(e) => update(r.tier_id, {name: e.target.value})} className={`${input} min-w-44`} />
                  {rowErrors[r.tier_id] && <p className="mt-1 text-xs text-red-600">{rowErrors[r.tier_id]}</p>}
                </td>
                <td className="py-1.5 pr-3">
                  <div className="flex items-center gap-1">
                    <input aria-label={`Multiplier for ${r.name}`} inputMode="decimal" value={r.multiplier}
                      onChange={(e) => update(r.tier_id, {multiplier: e.target.value})} className={`${input} w-24`} />
                    <span className="text-neutral-400">×</span>
                  </div>
                </td>
                <td className="py-1.5 pr-3">
                  <div className="flex items-center gap-1">
                    <input aria-label={`Share of sales for ${r.name}`} inputMode="decimal" value={r.sharePct}
                      onChange={(e) => update(r.tier_id, {sharePct: e.target.value})} className={`${input} w-24`} />
                    <span className="text-neutral-400">%</span>
                  </div>
                </td>
                <td className="py-1.5 pt-3.5">
                  <input
                    type="radio"
                    name="default-tier"
                    aria-label={`Make ${r.name} the default`}
                    checked={r.is_default}
                    onChange={() => setRows((prev) => prev.map((x) => ({...x, is_default: x.tier_id === r.tier_id})))}
                    className="h-4 w-4 accent-violet-600"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        The default tier is used for any checkout where no tier is chosen.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-xl px-4 py-3 ${sharesOk ? "bg-neutral-50" : "bg-red-50"}`}>
          <p className="text-xs text-neutral-500">Shares of sales add up to</p>
          <p className={`text-lg font-semibold tabular-nums ${sharesOk ? "text-neutral-900" : "text-red-600"}`}>
            {Number(totalShare.toFixed(3))}%
          </p>
          {!sharesOk && <p className="text-xs text-red-600">Must add up to 100%</p>}
        </div>
        <div className={`rounded-xl px-4 py-3 ${funded ? "bg-green-50" : "bg-amber-50"}`}>
          <p className="text-xs text-neutral-500">Weighted multiplier</p>
          <p className={`text-lg font-semibold tabular-nums ${funded ? "text-green-700" : "text-amber-700"}`}>
            {Number(weighted.toFixed(4))}
          </p>
          <p className={`text-xs ${funded ? "text-green-700" : "text-amber-700"}`}>
            {funded
              ? "Discounts are funded by premiums across the expected mix"
              : `Costs under-recovered by about ${((1 - weighted) * 100).toFixed(1)}% across all sales`}
          </p>
        </div>
      </div>

      {!funded && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="below-cost-reason" className="text-sm font-semibold text-neutral-900">
            Why is under-recovering costs deliberate?
          </label>
          <textarea id="below-cost-reason" rows={2} value={belowCostReason} onChange={(e) => setBelowCostReason(e.target.value)}
            placeholder="e.g. Growth investment in emerging cities for the first two terms"
            className="rounded-xl border border-amber-200 p-3 text-sm outline-none focus:border-violet-500" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tier-change-reason" className="text-sm font-semibold text-neutral-900">
          Why are these changing?
        </label>
        <textarea id="tier-change-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Rebalanced after the first term's sales mix"
          className="rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-violet-500" />
      </div>

      {saveError && (
        <div className="text-sm text-red-600">
          <p>{saveError.message}</p>
          {saveError.conflict && (
            <button type="button" onClick={onReload} className="mt-1 font-semibold underline">
              Load the latest tiers
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSave} disabled={save.isPending || unchanged}
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
          {save.isPending ? "Saving…" : unchanged ? "No changes to save" : "Save tiers"}
        </button>
        <p className="text-xs text-neutral-400">Applies to new purchases once prices are published. Every save is recorded.</p>
      </div>
    </div>
  );
}
