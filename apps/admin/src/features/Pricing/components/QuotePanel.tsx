"use client";

import {useState} from "react";
import type {ApiPriceQuote, ApiTierPrice} from "../services/templates.service";

const NGN = new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0});
const naira = (v: string | number) => `₦${NGN.format(Number(v))}`;
const pct = (v: number) => `${(v * 100).toFixed(1).replace(/\.0$/, "")}%`;

// Same grouping and validated palette as the approved pricing calculator, so
// the console and the spec's reference page read the same way.
const GROUPS = [
  {key: "teaching", label: "Live teaching", color: "#2a78d6"},
  {key: "delivery", label: "AI, messaging, hosting & other", color: "#eb6834"},
  {key: "acquisition", label: "Ads & referrals", color: "#1baf7a"},
  {key: "fees", label: "VAT, gateway & refunds", color: "#eda100"},
  {key: "recovery", label: "Development & overhead", color: "#e87ba4"},
  {key: "profit", label: "Profit before tax", color: "#008300"},
] as const;

type GroupKey = (typeof GROUPS)[number]["key"];

const grouped = (tier: ApiTierPrice): Record<GroupKey, number> => {
  const b = tier.breakdown;
  const direct = Object.entries(b.direct_costs);
  const acquisitionDirect = direct.filter(([k]) => k === "acquisition").reduce((s, [, v]) => s + Number(v), 0);
  const otherDirect = direct.filter(([k]) => k !== "acquisition").reduce((s, [, v]) => s + Number(v), 0);
  return {
    teaching: Number(b.live_teaching),
    delivery: otherDirect,
    acquisition: acquisitionDirect + Number(b.referral_payout),
    fees: Number(b.vat) + Number(b.gateway_fee) + Number(b.refund_reserve),
    recovery: Number(b.development_recovery) + Number(b.overhead_recovery),
    profit: Number(b.profit_before_tax),
  };
};

export default function QuotePanel({
  quote,
  currentPrice,
  loading,
  message,
}: {
  quote: ApiPriceQuote | null;
  currentPrice: number;
  loading: boolean;
  message: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!quote) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-neutral-900">Price in each city tier</h2>
        <p className={`mt-3 text-sm ${message ? "text-amber-700" : "text-neutral-400"}`}>
          {loading ? "Working out prices…" : message ?? "Fill in the figures to see prices."}
        </p>
      </div>
    );
  }

  const tier = quote.tiers.find((t) => t.tier_id === selected) ?? quote.tiers.find((t) => t.is_default) ?? quote.tiers[0];
  const parts = grouped(tier);
  const total = Number(tier.student_pays);
  const weighted = Number(quote.weighted_multiplier);

  return (
    <div className={`rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-opacity ${loading ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold text-neutral-900">Price in each city tier</h2>
        <span className="text-xs text-neutral-400">
          Parameters v{quote.parameter_version} · tiers r{quote.tier_revision}
        </span>
      </div>

      {message && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{message}</p>}

      {quote.within_market_ceiling === false && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          Prices in red are above the market ceiling of {naira(quote.market_ceiling!)}, so this edition can&apos;t be
          published at these costs.
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Figure label="Direct cost per student" value={naira(quote.direct_cost_per_enrolment)} />
        <Figure label="Development per student" value={naira(quote.development_cost_per_enrolment)} />
        <Figure label="Overhead per student" value={naira(quote.overhead_per_enrolment)} />
        <Figure label="Margin before tax" value={pct(Number(quote.pre_tax_margin))} note={quote.margin_overridden ? "This program's own" : undefined} />
        <Figure label="Hard floor (before VAT)" value={naira(quote.hard_floor)} note="Covers delivery, earns nothing" />
        <Figure label="Full cost (before VAT)" value={naira(quote.full_cost_base)} note="At multiplier 1.00" />
      </dl>

      <table className="mt-5 w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-neutral-400">
            <th className="pb-2 font-medium">Tier</th>
            <th className="pb-2 text-right font-medium">Student pays</th>
            <th className="pb-2 text-right font-medium">vs today</th>
          </tr>
        </thead>
        <tbody>
          {quote.tiers.map((t) => {
            const diff = currentPrice > 0 ? Number(t.student_pays) / currentPrice - 1 : null;
            const active = t.tier_id === tier.tier_id;
            return (
              <tr key={t.tier_id} onClick={() => setSelected(t.tier_id)}
                className={`cursor-pointer border-t border-neutral-100 ${active ? "bg-violet-50/60" : "hover:bg-neutral-50"}`}>
                <td className="py-2 pl-1">
                  <span className="font-medium text-neutral-900">{t.name}</span>
                  <span className="ml-1.5 text-xs text-neutral-400">×{Number(t.multiplier)}{t.is_default ? " · default" : ""}</span>
                </td>
                <td className={`py-2 text-right font-semibold tabular-nums ${t.above_market_ceiling ? "text-red-600" : "text-neutral-900"}`}>
                  {naira(t.student_pays)}
                  {t.above_market_ceiling && <span className="sr-only"> (above the market ceiling)</span>}
                </td>
                <td className={`py-2 pr-1 text-right text-xs tabular-nums ${diff === null ? "text-neutral-400" : diff >= 0 ? "text-neutral-600" : "text-amber-700"}`}>
                  {diff === null ? "—" : `${diff >= 0 ? "+" : "−"}${Math.abs(diff * 100).toFixed(0)}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-neutral-400">
        &ldquo;vs today&rdquo; compares with the flat {currentPrice > 0 ? naira(currentPrice) : "price"} charged now.
        {weighted < 1 && ` Tier discounts are unfunded (weighted multiplier ${Number(weighted.toFixed(4))}).`}
      </p>

      <div className="mt-5">
        <p className="text-sm font-semibold text-neutral-900">
          Where {naira(tier.student_pays)} goes · {tier.name}
        </p>
        <div className="mt-2 flex h-4 gap-0.5" role="img" aria-label={`Breakdown of ${naira(tier.student_pays)} for ${tier.name}`}>
          {GROUPS.map((g) => {
            const share = total > 0 ? Math.max(parts[g.key], 0) / total : 0;
            return share > 0 ? (
              <span key={g.key} title={`${g.label}: ${naira(parts[g.key])} (${pct(share)})`}
                style={{flex: `${share} 1 0`, background: g.color}} className="h-full first:rounded-l last:rounded-r" />
            ) : null;
          })}
        </div>
        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
          {GROUPS.map((g) => (
            <li key={g.key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-neutral-600">
                <span className="h-2.5 w-2.5 rounded-sm" style={{background: g.color}} />
                {g.label}
              </span>
              <span className="tabular-nums text-neutral-900">
                {naira(parts[g.key])} <span className="text-xs text-neutral-400">{total > 0 ? pct(parts[g.key] / total) : ""}</span>
              </span>
            </li>
          ))}
        </ul>
        {Number(tier.breakdown.income_tax_provision) > 0 && (
          <p className="mt-2 text-xs text-neutral-400">
            {naira(tier.breakdown.income_tax_provision)} of the profit is set aside for company tax.
          </p>
        )}
      </div>
    </div>
  );
}

function Figure({label, value, note}: {label: string; value: string; note?: string}) {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="font-semibold tabular-nums text-neutral-900">{value}</dd>
      {note && <p className="text-[11px] text-neutral-400">{note}</p>}
    </div>
  );
}
