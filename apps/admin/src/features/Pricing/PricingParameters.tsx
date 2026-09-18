"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {Icon, showSuccess} from "@mcc/ui";
import {
  useActivePricingParameters,
  useCreatePricingParameters,
  usePricingVersion,
} from "./hooks/usePricingParameters";
import {
  emptyForm,
  fingerprint,
  fromApi,
  PricingForm,
  preview,
  toInput,
  validate,
} from "./helper/pricingForm";
import {ApiPricingParameters, pricingErrorMessage} from "./services/pricing.service";
import OverheadLinesEditor from "./components/OverheadLinesEditor";
import VersionHistory from "./components/VersionHistory";
import PricingNav from "./components/PricingNav";
import {AccountantNote, ChoiceGroup, NumberField, Section} from "./components/Fields";

const naira = new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0});
const ngn = (n: number) => (Number.isFinite(n) ? `₦${naira.format(n)}` : "—");
const percent = (n: number, digits = 2) =>
  Number.isFinite(n) ? `${(n * 100).toFixed(digits).replace(/\.?0+$/, "")}%` : "—";

/**
 * Pricing model build step 1 -- the company parameters every course and exam
 * program price is built from. See docs/pricing-model.md in the backend repo.
 */
export default function PricingParameters() {
  const active = useActivePricingParameters();
  // A past version the admin is inspecting (read-only), or null for the active one.
  const [viewing, setViewing] = useState<number | null>(null);
  // A past version the admin chose to start a new version from.
  const [seed, setSeed] = useState<ApiPricingParameters | null>(null);
  const past = usePricingVersion(viewing);

  const activeParams = active.data ?? null;
  const activeVersion = activeParams?.version_number ?? null;

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Link href="/finance" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
          <Icon icon="ph:arrow-left" size={14} />
          Finance
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Pricing parameters</h1>
        <p className="mt-1 max-w-2xl text-base text-neutral-700">
          The company-wide figures every course and exam program price is calculated from. Saving
          creates a new version that applies to prices set from then on; earlier versions stay
          exactly as they were.
        </p>
      </div>
      {activeVersion !== null && (
        <span className="rounded-full bg-green-50 px-3 py-1.5 text-base font-medium text-green-700">
          Active: version {activeVersion}
        </span>
      )}
      <div className="basis-full">
        <PricingNav />
      </div>
    </div>
  );

  if (active.isLoading) {
    return (
      <section className="flex flex-col gap-6 pb-10">
        {header}
        <p className="text-base text-neutral-600">Loading pricing parameters…</p>
      </section>
    );
  }

  if (active.isError) {
    return (
      <section className="flex flex-col gap-6 pb-10">
        {header}
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-base text-red-700">
          {pricingErrorMessage(active.error, "Couldn't load pricing parameters.")}{" "}
          <button type="button" onClick={() => active.refetch()} className="font-semibold underline">
            Try again
          </button>
        </div>
      </section>
    );
  }

  const viewingPast = viewing !== null;
  const source = viewingPast ? past.data ?? null : seed ?? activeParams;
  const editorKey = viewingPast
    ? `view-${viewing}`
    : `edit-${activeVersion ?? "new"}-${seed?.version_number ?? "active"}`;

  return (
    <section className="flex flex-col gap-6 pb-10">
      {header}

      {viewingPast && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-base text-violet-900">
          <span>
            Viewing version {viewing}, which is no longer active. It can&apos;t be edited.
          </span>
          <div className="flex gap-2">
            {past.data && (
              <button
                type="button"
                onClick={() => {
                  setSeed(past.data);
                  setViewing(null);
                }}
                className="rounded-full bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
              >
                Start a new version from this one
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewing(null)}
              className="rounded-full border border-violet-200 bg-white px-4 py-2 font-medium text-violet-900 hover:bg-violet-50"
            >
              Back to active version
            </button>
          </div>
        </div>
      )}

      {!viewingPast && seed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-base text-amber-900">
          <span>
            Editing from version {seed.version_number}. Saving creates version {(activeVersion ?? 0) + 1}.
          </span>
          <button
            type="button"
            onClick={() => setSeed(null)}
            className="rounded-full border border-amber-200 bg-white px-4 py-2 font-medium hover:bg-amber-100"
          >
            Discard and edit the active version
          </button>
        </div>
      )}

      {!viewingPast && activeVersion === null && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-base text-violet-900">
          No pricing parameters have been set yet. Fill in the figures below to create version 1.
          Nothing can be priced until they exist.
        </div>
      )}

      {viewingPast && past.isLoading ? (
        <p className="text-base text-neutral-600">Loading version {viewing}…</p>
      ) : (
        <ParametersEditor
          key={editorKey}
          source={source}
          active={activeParams}
          readOnly={viewingPast}
          onSaved={() => setSeed(null)}
          onReloadLatest={() => {
            setSeed(null);
            active.refetch();
          }}
        />
      )}

      <VersionHistory
        activeVersion={activeVersion}
        viewing={viewing}
        onView={(n) => {
          setViewing(n);
          window.scrollTo({top: 0, behavior: "smooth"});
        }}
      />
    </section>
  );
}

function ParametersEditor({
  source,
  active,
  readOnly,
  onSaved,
  onReloadLatest,
}: {
  source: ApiPricingParameters | null;
  active: ApiPricingParameters | null;
  readOnly: boolean;
  onSaved: () => void;
  onReloadLatest: () => void;
}) {
  const [form, setForm] = useState<PricingForm>(() => (source ? fromApi(source) : emptyForm()));
  const [reason, setReason] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<{message: string; conflict: boolean} | null>(null);
  const save = useCreatePricingParameters();

  const errors = useMemo(() => validate(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;
  const figures = useMemo(() => preview(form), [form]);

  const activeFingerprint = useMemo(() => (active ? fingerprint(fromApi(active)) : null), [active]);
  const unchanged = !hasErrors && activeFingerprint !== null && fingerprint(form) === activeFingerprint;

  const set = <K extends keyof PricingForm>(field: K) => (value: PricingForm[K]) =>
    setForm((prev) => ({...prev, [field]: value}));
  const shown = (field: keyof PricingForm) => (showErrors ? errors[field] : undefined);

  const handleSave = () => {
    setSaveError(null);
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    // The server rejects this too; catching it here saves a round trip and
    // keeps the explanation next to the figure that shows the problem.
    if (figures.headroom <= 0) {
      setSaveError({
        message: "Fees, referrals, refunds and the margin take every naira of the price. Lower the margin or one of those rates.",
        conflict: false,
      });
      return;
    }
    if (reason.trim().length < 3) {
      setSaveError({message: "Say briefly why these figures are changing.", conflict: false});
      return;
    }
    save.mutate(toInput(form, active?.version_number ?? null, reason), {
      onSuccess: (saved) => {
        showSuccess(`Saved as version ${saved.version_number}`);
        onSaved();
      },
      onError: (error) => {
        const status = (error as {response?: {status?: number}})?.response?.status;
        setSaveError({
          message: pricingErrorMessage(error, "Couldn't save the pricing parameters."),
          conflict: status === 409,
        });
      },
    });
  };

  const headroomTone =
    !Number.isFinite(figures.headroom) ? "text-neutral-600"
      : figures.headroom <= 0 ? "text-red-600"
        : figures.headroom < 0.5 ? "text-amber-600"
          : "text-green-700";

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Section
          title="Company overheads"
          description="Running costs per year that don't depend on any single course: legal, accounting, CAC filings, equipment, hosting, licences, brand advertising and non-course staff. Course development payroll belongs to each course's own costs, not here."
        >
          <OverheadLinesEditor
            lines={form.lines}
            onChange={set("lines")}
            lineNgn={figures.lineNgn}
            errors={showErrors ? errors : {}}
            showVatColumnNote={form.vatTreatment === "exempt"}
            readOnly={readOnly}
          />
        </Section>

        <Section
          title="Expected enrolments"
          description="Paid enrolments expected per year across every course and exam program. Overheads are spread across these."
        >
          <div className="max-w-xs">
            <NumberField
              id="enrolments"
              label="Paid enrolments per year"
              value={form.enrolments}
              onChange={set("enrolments")}
              error={shown("enrolments")}
              readOnly={readOnly}
            />
          </div>
        </Section>

        <Section
          title="VAT"
          description="Standard-rated courses have VAT added on top of the price. Exempt and zero-rated courses have none; if exempt, VAT paid on costs can't be reclaimed."
          aside={<AccountantNote decision="D4" />}
        >
          <div className="flex flex-col gap-4">
            <ChoiceGroup
              name="vatTreatment"
              value={form.vatTreatment}
              onChange={set("vatTreatment")}
              error={shown("vatTreatment")}
              readOnly={readOnly}
              options={[
                {value: "standard", label: "Standard-rated", description: "VAT added to every price"},
                {value: "exempt", label: "Exempt", description: "No VAT; VAT on costs not reclaimable"},
                {value: "zero_rated", label: "Zero-rated", description: "No VAT; VAT on costs reclaimable"},
              ]}
            />
            <div className="max-w-xs">
              <NumberField
                id="vatPct"
                label="VAT rate"
                suffix="%"
                value={form.vatPct}
                onChange={set("vatPct")}
                error={shown("vatPct")}
                readOnly={readOnly}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Company tax"
          description="Income tax is owed on annual profit, not per sale, so it isn't added as a cost. The target margin is raised enough that it still holds after tax."
          aside={<AccountantNote decision="D5" />}
        >
          <div className="flex flex-col gap-4">
            <ChoiceGroup
              name="taxStatus"
              value={form.taxStatus}
              onChange={set("taxStatus")}
              error={shown("taxStatus")}
              readOnly={readOnly}
              options={[
                {value: "small", label: "Small company", description: "No income tax or development levy"},
                {value: "standard", label: "Standard rate", description: "Income tax plus development levy"},
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="incomeTaxPct"
                label="Company income tax"
                suffix="%"
                value={form.incomeTaxPct}
                onChange={set("incomeTaxPct")}
                error={shown("incomeTaxPct")}
                hint={form.taxStatus === "small" ? "Not applied while a small company" : undefined}
                readOnly={readOnly}
              />
              <NumberField
                id="levyPct"
                label="Development levy"
                suffix="%"
                value={form.levyPct}
                onChange={set("levyPct")}
                error={shown("levyPct")}
                hint={form.taxStatus === "small" ? "Not applied while a small company" : undefined}
                readOnly={readOnly}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Fees, referrals and refunds"
          description="Charged as a share of what the student pays. The gateway fee applies to the VAT-inclusive amount."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="gatewayPct" label="Payment gateway fee" suffix="%" value={form.gatewayPct}
              onChange={set("gatewayPct")} error={shown("gatewayPct")} readOnly={readOnly} />
            <NumberField id="refundPct" label="Refund reserve" suffix="%" value={form.refundPct}
              onChange={set("refundPct")} error={shown("refundPct")} readOnly={readOnly}
              hint="Expected refunds and chargebacks" />
            <NumberField id="referralSharePct" label="Sales that come from referrals" suffix="%"
              value={form.referralSharePct} onChange={set("referralSharePct")}
              error={shown("referralSharePct")} readOnly={readOnly} />
            <NumberField id="referralPayoutPct" label="Referral payout" suffix="%"
              value={form.referralPayoutPct} onChange={set("referralPayoutPct")}
              error={shown("referralPayoutPct")} readOnly={readOnly}
              hint="Paid on each referred sale" />
          </div>
        </Section>

        <Section title="Margin" description="The profit left after company tax, as a share of each price before VAT.">
          <div className="max-w-xs">
            <NumberField id="marginPct" label="Target after-tax margin" suffix="%" value={form.marginPct}
              onChange={set("marginPct")} error={shown("marginPct")} readOnly={readOnly} />
          </div>
        </Section>

        <Section
          title="Exchange rate"
          description="AI, hosting, Zoom and Google bill in US dollars. Dollar costs are converted at this rate plus a buffer against the naira weakening."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="usdRate" label="Naira per US dollar" prefix="₦" value={form.usdRate}
              onChange={set("usdRate")} error={shown("usdRate")} readOnly={readOnly} />
            <NumberField id="fxBufferPct" label="Buffer" suffix="%" value={form.fxBufferPct}
              onChange={set("fxBufferPct")} error={shown("fxBufferPct")} readOnly={readOnly} />
            <NumberField id="fxThresholdPct" label="Review prices if the naira moves by" suffix="%"
              value={form.fxThresholdPct} onChange={set("fxThresholdPct")}
              error={shown("fxThresholdPct")} readOnly={readOnly} />
          </div>
        </Section>

        <Section title="Brainy AI"
          description="How Brainy usage is paid for. Each course's AI cost buys tokens at the provider price below, spread monthly as that course's allowance. Everyone also gets free tokens each day. Beyond both, answers cost gems. Earned gems are spent first, and only purchased gems can buy courses.">
          <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
            <NumberField id="aiUsdPerMillion" label="AI provider price per million tokens" prefix="$"
              value={form.aiUsdPerMillion} onChange={set("aiUsdPerMillion")}
              error={shown("aiUsdPerMillion")} readOnly={readOnly}
              hint="Blended across prompt and answer tokens" />
            <NumberField id="freeDailyTokens" label="Free tokens per student per day"
              value={form.freeDailyTokens} onChange={set("freeDailyTokens")}
              error={shown("freeDailyTokens")} readOnly={readOnly}
              hint="About 500 tokens a plain question" />
            <NumberField id="tokensPerGem" label="Tokens one gem buys"
              value={form.tokensPerGem} onChange={set("tokensPerGem")}
              error={shown("tokensPerGem")} readOnly={readOnly} />
            <NumberField id="flatMonthlyTokens" label="Monthly tokens for a course bought at an old flat price"
              value={form.flatMonthlyTokens} onChange={set("flatMonthlyTokens")}
              error={shown("flatMonthlyTokens")} readOnly={readOnly}
              hint="Those purchases have no AI cost on record" />
          </div>
        </Section>

        <Section title="Rounding and price rises"
          description="Student prices, including VAT, are rounded up to a multiple of the rounding amount. When new prices are published, no tier's price may rise by more than the phase-in cap over the price it replaces; larger rises are reached over several publishes. Decreases apply in full.">
          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            <NumberField id="roundingStep" label="Round prices up to the nearest" prefix="₦"
              value={form.roundingStep} onChange={set("roundingStep")}
              error={shown("roundingStep")} readOnly={readOnly} />
            <NumberField id="maxIncreasePct" label="Phase-in cap per publish" suffix="%"
              value={form.maxIncreasePct} onChange={set("maxIncreasePct")}
              error={shown("maxIncreasePct")} readOnly={readOnly} />
          </div>
        </Section>
      </div>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900">What these figures produce</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {readOnly ? "As saved in this version." : "Updates as you type. Saved figures are recalculated by the server."}
          </p>
          <dl className="mt-4 flex flex-col gap-3 text-base">
            <Figure label="Left to cover costs" value={percent(figures.headroom, 1)} valueClass={headroomTone}
              note={figures.headroom <= 0 ? "Fees and margin take every naira. Nothing could be priced." : "Share of each price before VAT"} />
            <Figure label="Lost to fees, referrals, refunds" value={percent(figures.deductions, 3)} />
            <Figure label="Pre-tax margin" value={percent(figures.preTaxMargin)} />
            <Figure label="VAT added to prices" value={percent(figures.vat)} />
            <Figure label="Tax rate applied" value={percent(figures.tax)} />
            <div className="my-1 border-t border-neutral-100" />
            <Figure label="Annual overhead" value={ngn(figures.annualOverhead)} />
            <Figure label="Overhead per enrolment" value={figures.overheadPerEnrolment === null ? "—" : ngn(figures.overheadPerEnrolment)} />
            <Figure label="Dollar costs converted at" value={Number.isFinite(figures.usdEffective) ? `${ngn(figures.usdEffective)} / $1` : "—"} />
          </dl>
        </div>

        {!readOnly && (
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <label htmlFor="change-reason" className="text-base font-semibold text-neutral-900">
              Why are these changing?
            </label>
            <textarea
              id="change-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={active ? "e.g. Updated hosting costs after the new annual contract" : "e.g. Initial figures from the 2026 budget"}
              className="mt-2 w-full rounded-xl border border-neutral-200 p-3 text-base text-neutral-900 outline-none focus:border-violet-500"
            />
            {showErrors && hasErrors && (
              <p className="mt-2 text-sm text-red-600">Some figures need fixing before this can be saved.</p>
            )}
            {saveError && (
              <div className="mt-2 text-sm text-red-600">
                <p>{saveError.message}</p>
                {saveError.conflict && (
                  <button type="button" onClick={onReloadLatest} className="mt-1 font-semibold underline">
                    Load the latest version
                  </button>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={save.isPending || unchanged}
              className="mt-4 w-full rounded-full bg-violet-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
              {save.isPending
                ? "Saving…"
                : unchanged
                  ? "No changes to save"
                  : `Save as version ${(active?.version_number ?? 0) + 1}`}
            </button>
            <p className="mt-2 text-sm text-neutral-600">
              Applies to prices set after saving. Existing prices keep the version they were built on.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Figure({label, value, note, valueClass = "text-neutral-900"}: {label: string; value: string; note?: string; valueClass?: string}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <dt className="text-neutral-800">{label}</dt>
        {note && <p className="text-sm text-neutral-600">{note}</p>}
      </div>
      <dd className={`font-semibold tabular-nums ${valueClass}`}>{value}</dd>
    </div>
  );
}
