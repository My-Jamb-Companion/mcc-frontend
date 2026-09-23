"use client";

import {ReactNode, useMemo, useState} from "react";
import {showSuccess} from "@mcc/ui";
import {Section} from "./Fields";
import {fractionToPct} from "../helper/pricingForm";
import PublicationHistory from "./PublicationHistory";
import {
  completeOverrides,
  overrideError,
  OverrideDrafts,
  publishInput,
  publishProblems,
  PublishReasons,
} from "../helper/publishForm";
import {useEditionPublications, usePublicationPreview, usePublishPrices} from "../hooks/usePublications";
import type {ApiProposedTier} from "../services/publications.service";
import type {Edition, ProgramType} from "../services/templates.service";
import {pricingErrorMessage} from "../services/pricing.service";

const naira = (v: string | number) => `₦${new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0}).format(Number(v))}`;

/**
 * Pricing model build step 4 -- publish this edition's prices, with the
 * guardrails shown before the admin commits: the phase-in cap (D11), the
 * market ceiling (D12), overrides and the second-admin rule (D9).
 */
export default function PublishPanel({
  programType,
  programId,
  edition,
  savedVersion,
  unsavedChanges,
}: {
  programType: ProgramType;
  programId: string;
  edition: Edition;
  savedVersion: number | null;
  unsavedChanges: boolean;
}) {
  const [drafts, setDrafts] = useState<OverrideDrafts>({});
  const [reasons, setReasons] = useState<PublishReasons>({change: "", phaseIn: "", belowCost: ""});
  const [attempted, setAttempted] = useState(false);
  const [publishError, setPublishError] = useState<{message: string; conflict: boolean} | null>(null);

  const overrides = useMemo(() => completeOverrides(drafts), [drafts]);
  const preview = usePublicationPreview(programType, programId, edition, overrides, savedVersion !== null);
  const history = useEditionPublications(programType, programId, edition);
  const publish = usePublishPrices(programType, programId, edition);

  const proposal = preview.data;
  const problems = publishProblems(proposal, drafts, reasons);
  const inForce = history.data?.find((p) => p.in_force);

  const setDraft = (tierId: string, patch: Partial<{price: string; reason: string}>) =>
    setDrafts((d) => ({...d, [tierId]: {...(d[tierId] ?? {price: "", reason: ""}), ...patch}}));

  const handlePublish = () => {
    setAttempted(true);
    setPublishError(null);
    if (!proposal || problems.length > 0) return;
    publish.mutate(publishInput(proposal, drafts, reasons), {
      onSuccess: (pub) => {
        showSuccess(pub.status === "published"
          ? `Publication ${pub.publication_number} is now in force`
          : `Publication ${pub.publication_number} is waiting for a second admin`);
        setDrafts({});
        setReasons({change: "", phaseIn: "", belowCost: ""});
        setAttempted(false);
      },
      onError: (e) => {
        const status = (e as {response?: {status?: number}})?.response?.status;
        setPublishError({message: pricingErrorMessage(e, "Couldn't publish these prices."), conflict: status === 409});
      },
    });
  };

  const description = inForce
    ? `Publication ${inForce.publication_number} is in force${inForce.published_at ? ` since ${new Date(inForce.published_at).toLocaleDateString("en-NG", {day: "numeric", month: "short", year: "numeric"})}` : ""}. Publishing again changes what new purchases pay; purchases already started keep their price.`
    : edition === "premium"
      ? "Nothing published yet. Premium is sold as an upgrade to standard, so publishing it doesn't change the course's headline price."
      : "Nothing published yet, so new purchases pay the program's flat price. Once published, each student pays their city tier's price.";

  return (
    <Section title="Publish prices" description={description}>
      {savedVersion === null ? (
        <p className="text-sm text-neutral-500">Save a cost template first — prices are published from a saved version.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {unsavedChanges && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              The cost template has unsaved changes. Publishing uses saved version {savedVersion}; save first to publish the new figures.
            </p>
          )}

          {preview.isLoading ? (
            <p className="text-sm text-neutral-400">Working out what would be published…</p>
          ) : preview.isError || !proposal ? (
            <p className="text-sm text-red-600">
              {pricingErrorMessage(preview.error, "Couldn't work out the prices to publish.")}{" "}
              <button type="button" className="font-semibold underline" onClick={() => preview.refetch()}>Try again</button>
            </p>
          ) : (
            <>
              <div className={`overflow-x-auto transition-opacity ${preview.isFetching ? "opacity-60" : ""}`}>
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-neutral-400">
                      <th className="pb-2 pr-3 font-medium">Tier</th>
                      <th className="pb-2 pr-3 text-right font-medium">{proposal.active_publication ? "In force" : "Flat price now"}</th>
                      <th className="pb-2 pr-3 text-right font-medium">Formula</th>
                      <th className="pb-2 pr-3 text-right font-medium" title={`At most ${fractionToPct(proposal.max_price_increase_rate)}% above the price it replaces`}>
                        Phase-in limit
                      </th>
                      <th className="pb-2 pr-3 font-medium">Override</th>
                      <th className="pb-2 text-right font-medium">Will charge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {proposal.tiers.map((t) => (
                      <TierRow key={t.tier_id} tier={t} draft={drafts[t.tier_id]} onChange={(patch) => setDraft(t.tier_id, patch)} />
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="-mt-2 text-xs text-neutral-400">
                Built from cost template v{proposal.template_version} · parameters v{proposal.parameter_version} · tiers r{proposal.tier_revision}.
                Hard floor {naira(proposal.hard_floor_student_pays)}
                {proposal.market_ceiling ? ` · market ceiling ${naira(proposal.market_ceiling)}` : ""}. Amounts include VAT.
              </p>

              {proposal.blockers.length > 0 && (
                <ul className="flex list-disc flex-col gap-1 rounded-xl bg-red-50 py-3 pl-8 pr-4 text-sm text-red-700">
                  {proposal.blockers.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}

              {proposal.second_admin_required && proposal.blockers.length === 0 && (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  At least one tier would sell below its hard floor of {naira(proposal.hard_floor_student_pays)}, losing money on
                  every sale. This will wait for a different admin to confirm before it applies.
                </p>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                {proposal.phase_in_reason_required && (
                  <Reason id="phase-in-reason" label="Why phase in below the formula price?"
                    placeholder="e.g. Existing families expect gradual rises; reaching the formula over two terms"
                    value={reasons.phaseIn} onChange={(phaseIn) => setReasons((r) => ({...r, phaseIn}))} />
                )}
                {proposal.below_cost_reason_required && (
                  <Reason id="below-cost-reason"
                    label={`Why are tier discounts unfunded? (weighted multiplier ${Number(Number(proposal.weighted_multiplier).toFixed(4))})`}
                    placeholder="e.g. Growth investment in emerging cities for the launch year"
                    value={reasons.belowCost} onChange={(belowCost) => setReasons((r) => ({...r, belowCost}))} />
                )}
                <Reason id="publish-reason" label="Why publish these prices?"
                  placeholder="e.g. First city-tier prices for the new term"
                  value={reasons.change} onChange={(change) => setReasons((r) => ({...r, change}))} />
              </div>

              {attempted && problems.length > 0 && (
                <ul className="flex list-disc flex-col gap-1 pl-5 text-xs text-red-600">
                  {problems.filter((p) => !proposal.blockers.includes(p)).map((p) => <li key={p}>{p}</li>)}
                </ul>
              )}
              {publishError && (
                <div className="text-sm text-red-600">
                  <p>{publishError.message}</p>
                  {publishError.conflict && (
                    <button type="button" onClick={() => preview.refetch()} className="mt-1 font-semibold underline">
                      Review the latest prices
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={handlePublish}
                  disabled={publish.isPending || preview.isFetching || proposal.blockers.length > 0 || !proposal.changes_prices}
                  className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                  {publish.isPending
                    ? "Publishing…"
                    : !proposal.changes_prices && proposal.blockers.length === 0
                      ? "These prices are in force"
                      : proposal.second_admin_required
                        ? "Submit for a second admin"
                        : "Publish prices"}
                </button>
                <span className="text-xs text-neutral-400">New purchases only. Checkouts already started keep their price.</span>
              </div>
            </>
          )}

          <PublicationHistory publications={history.data ?? []} />
        </div>
      )}
    </Section>
  );
}

function TierRow({tier, draft, onChange}: {
  tier: ApiProposedTier;
  draft: {price: string; reason: string} | undefined;
  onChange: (patch: Partial<{price: string; reason: string}>) => void;
}) {
  const error = overrideError(draft);
  const hasPrice = Boolean(draft?.price.trim());
  const change = tier.change !== null ? Number(tier.change) : null;

  return (
    <tr className="align-top">
      <td className="py-2.5 pr-3">
        <p className="font-medium text-neutral-900">{tier.tier_name}</p>
        <p className="text-xs text-neutral-400">×{Number(tier.multiplier)}{tier.is_default ? " · default" : ""}</p>
      </td>
      <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-600">{tier.previous_price ? naira(tier.previous_price) : "—"}</td>
      <td className={`py-2.5 pr-3 text-right tabular-nums ${tier.above_market_ceiling ? "font-semibold text-red-600" : "text-neutral-600"}`}>
        {naira(tier.formula_price)}
      </td>
      <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-600">{tier.phase_in_limit ? naira(tier.phase_in_limit) : "—"}</td>
      <td className="py-2 pr-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <span className="text-neutral-400">₦</span>
            <input aria-label={`Override price for ${tier.tier_name}`} inputMode="decimal" value={draft?.price ?? ""}
              onChange={(e) => onChange({price: e.target.value})} placeholder="Formula"
              className="w-28 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm tabular-nums outline-none focus:border-violet-500" />
          </div>
          {hasPrice && (
            <input aria-label={`Reason for overriding ${tier.tier_name}`} value={draft?.reason ?? ""}
              onChange={(e) => onChange({reason: e.target.value})} placeholder="Reason"
              className="w-44 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm outline-none focus:border-violet-500" />
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </td>
      <td className="py-2.5 text-right">
        <p className="font-semibold tabular-nums text-neutral-900">{naira(tier.price)}</p>
        <p className="mt-0.5 flex flex-wrap justify-end gap-1 text-[11px]">
          {change !== null && change !== 0 && (
            <span className={change > 0 ? "text-neutral-500" : "text-amber-700"}>
              {change > 0 ? "+" : "−"}{naira(Math.abs(change))}
            </span>
          )}
          {tier.capped && !tier.override_price && <Badge tone="violet">Capped</Badge>}
          {tier.override_price && <Badge tone="violet">Override</Badge>}
          {tier.below_hard_floor && <Badge tone="amber">Below floor</Badge>}
        </p>
      </td>
    </tr>
  );
}

function Badge({tone, children}: {tone: "violet" | "amber"; children: ReactNode}) {
  const colors = tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-800";
  return <span className={`rounded-full px-1.5 py-0.5 font-medium ${colors}`}>{children}</span>;
}

function Reason({id, label, placeholder, value, onChange}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-800">{label}</label>
      <textarea id={id} rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-violet-500" />
    </div>
  );
}
