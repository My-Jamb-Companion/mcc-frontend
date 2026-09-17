"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {Icon, showSuccess} from "@mcc/ui";
import {NumberField, Section} from "./components/Fields";
import PublishPanel from "./components/PublishPanel";
import QuotePanel from "./components/QuotePanel";
import {
  DIRECT_COST_CATEGORIES,
  DirectCostForm,
  emptyTemplateForm,
  newDirectCost,
  TemplateErrors,
  TemplateForm,
  templateFormFromVersion,
  templateInput,
  validateTemplate,
} from "./helper/templateForm";
import {useQuotePreview, useSaveTemplateVersion, useTemplate, useTemplateVersions} from "./hooks/useTemplates";
import type {ApiTemplateDetail, DirectCostCategory, Edition, ProgramType} from "./services/templates.service";
import {pricingErrorMessage} from "./services/pricing.service";

const naira = (v: string | number) => `₦${new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0}).format(Number(v))}`;

/**
 * Pricing model build step 3 -- one edition's cost template, with its price in
 * every city tier recalculated by the server as the admin types.
 */
export default function CostTemplateEditor({
  programType,
  programId,
  edition,
}: {
  programType: ProgramType;
  programId: string;
  edition: Edition;
}) {
  const {data, isLoading, isError, error, refetch} = useTemplate(programType, programId, edition);
  const base = `/finance/pricing/programs/${programType}/${encodeURIComponent(programId)}`;

  return (
    <section className="flex flex-col gap-6 pb-10">
      <div>
        <Link href="/finance/pricing/programs" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
          <Icon icon="ph:arrow-left" size={14} />
          Program pricing
        </Link>
        {data && (
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{data.program.title}</h1>
              <p className="mt-1 text-sm text-neutral-500">
                {programType === "course" ? "Course" : "Exam program"} · {data.edition_label} · charged today:{" "}
                {Number(data.program.current_price) > 0 ? naira(data.program.current_price) : "free"}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${data.version ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
              {data.version ? `Version ${data.version.version_number}` : "Not costed yet"}
            </span>
          </div>
        )}
        {programType === "course" && (
          <nav aria-label="Edition" className="mt-4 inline-flex rounded-xl bg-neutral-100/80 p-1">
            {(["standard", "premium"] as const).map((e) => (
              <Link key={e} href={`${base}/${e}`} aria-current={e === edition ? "page" : undefined}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${e === edition ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}>
                {e === "standard" ? "Standard · group classes" : "Premium · one-on-one"}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-400">Loading cost template…</p>
      ) : isError || !data ? (
        <p className="text-sm text-red-600">
          {pricingErrorMessage(error, "Couldn't load this cost template.")}{" "}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button>
        </p>
      ) : (
        <>
          {/* Keyed on the saved version: saving re-initialises the form from the server. */}
          <TemplateEditorForm key={`${edition}-${data.version?.version_number ?? "new"}`} detail={data}
            programType={programType} programId={programId} edition={edition} />
          <VersionHistory programType={programType} programId={programId} edition={edition} />
        </>
      )}
    </section>
  );
}

function TemplateEditorForm({detail, programType, programId, edition}: {
  detail: ApiTemplateDetail;
  programType: ProgramType;
  programId: string;
  edition: Edition;
}) {
  const [form, setForm] = useState<TemplateForm>(() =>
    detail.version ? templateFormFromVersion(detail.version) : emptyTemplateForm(programType, edition),
  );
  const [reason, setReason] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<{message: string; conflict: boolean} | null>(null);

  const errors = useMemo(() => validateTemplate(form, edition), [form, edition]);
  const complete = Object.keys(errors).length === 0;
  const input = useMemo(() => (complete ? templateInput(form, edition) : null), [complete, form, edition]);

  const preview = useQuotePreview(programType, programId, edition, input);
  const save = useSaveTemplateVersion(programType, programId, edition);

  const savedInput = useMemo(
    () => (detail.version ? JSON.stringify(templateInput(templateFormFromVersion(detail.version), edition)) : null),
    [detail.version, edition],
  );
  const unchanged = input !== null && savedInput === JSON.stringify(input);

  const set = <K extends keyof TemplateForm>(key: K) => (value: TemplateForm[K]) => setForm((f) => ({...f, [key]: value}));
  const err = (key: keyof TemplateForm) => (showErrors ? errors[key] : undefined);

  // The preview shows the server's own objection (edition rules, a margin that
  // leaves nothing for costs, missing company parameters) rather than a guess.
  const previewMessage = !complete
    ? "Fill in the figures to see prices."
    : preview.isError
      ? pricingErrorMessage(preview.error, "Prices couldn't be worked out.")
      : null;

  const handleSave = () => {
    setSaveError(null);
    if (!complete || !input) {
      setShowErrors(true);
      setSaveError({message: "Some figures need fixing before this can be saved.", conflict: false});
      return;
    }
    if (reason.trim().length < 3) {
      setSaveError({message: "Say briefly why these costs are changing.", conflict: false});
      return;
    }
    save.mutate(
      {...input, based_on_version: detail.version?.version_number ?? null, change_reason: reason.trim()},
      {
        onSuccess: (saved) => showSuccess(`Saved as version ${saved.version?.version_number}`),
        onError: (e) => {
          const status = (e as {response?: {status?: number}})?.response?.status;
          setSaveError({message: pricingErrorMessage(e, "Couldn't save the cost template."), conflict: status === 409});
        },
      },
    );
  };

  const hasSessions = Number(form.liveSessions) > 0;
  const periodLabel = programType === "exam" ? "Exam cycles in use" : "Years in use";
  const perPeriodLabel = programType === "exam" ? "Enrolments per exam cycle" : "Enrolments per year";

  return (
    <>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Section title="Live teaching"
          description={edition === "premium"
            ? "One-on-one sessions: each student has the teacher to themselves, so the whole session is their cost."
            : "Group classes share the teacher's time, so each student's cost is the session divided by the class size. Use 0 sessions for a purely self-paced edition."}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="liveSessions" label="Live sessions per enrolment" value={form.liveSessions} onChange={set("liveSessions")} error={err("liveSessions")} />
            <NumberField id="hoursPerSession" label="Hours per session" value={form.hoursPerSession} onChange={set("hoursPerSession")} error={err("hoursPerSession")} disabled={!hasSessions} />
            <NumberField id="hourlyRate" label="Teacher pay per hour" prefix="₦" value={form.hourlyRate} onChange={set("hourlyRate")} error={err("hourlyRate")} disabled={!hasSessions} />
            <NumberField id="seats" label="Students per session" value={edition === "premium" ? "1" : form.seats} onChange={set("seats")}
              error={err("seats")} disabled={!hasSessions} readOnly={edition === "premium"}
              hint={edition === "premium" ? "Always 1 for one-on-one" : "The typical class size"} />
          </div>
        </Section>

        <Section title="Other direct costs per enrolment"
          description="What each additional student costs to serve, besides teaching: Brainy AI usage, messaging, hosting and video, ads per enrolment, mock-exam marking, materials. Dollar amounts convert at the company exchange rate plus buffer.">
          <DirectCostsEditor lines={form.directCosts} onChange={set("directCosts")} errors={showErrors ? errors : {}} />
        </Section>

        <Section title="Development"
          description={`The one-off cost of building this ${programType === "course" ? "course" : "program"} — development teachers' pay and any equipment bought for it — spread across the students expected over its life. Fewer expected students means more per student.`}>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="developmentCost" label="Development cost" prefix="₦" value={form.developmentCost} onChange={set("developmentCost")} error={err("developmentCost")} />
            <NumberField id="periods" label={periodLabel} value={form.periods} onChange={set("periods")} error={err("periods")} />
            <NumberField id="enrolmentsPerPeriod" label={perPeriodLabel} value={form.enrolmentsPerPeriod} onChange={set("enrolmentsPerPeriod")} error={err("enrolmentsPerPeriod")} />
          </div>
        </Section>

        <Section title="Market ceiling"
          description="The most students will realistically pay for this edition, VAT included. Prices can't be published while any tier's price is above it — a sign to rethink the costs, class size or expected enrolments rather than charge more than the market bears.">
          <div className="max-w-xs">
            <NumberField id="marketCeiling" label="Highest viable price" prefix="₦" value={form.marketCeiling}
              onChange={set("marketCeiling")} error={err("marketCeiling")} hint="Needed before publishing" />
          </div>
        </Section>

        <Section title="Margin" description="Uses the company's target margin unless this program needs its own — for example, a loss-leader that brings students in.">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
            <input type="checkbox" checked={form.overrideOn} onChange={(e) => set("overrideOn")(e.target.checked)} className="h-4 w-4 accent-violet-600" />
            Give this program its own after-tax margin
          </label>
          {form.overrideOn && (
            <div className="mt-4 grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
              <NumberField id="overridePct" label="After-tax margin" suffix="%" value={form.overridePct} onChange={set("overridePct")} error={err("overridePct")} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="overrideReason" className="text-sm font-medium text-neutral-800">Why does this program need its own margin?</label>
                <textarea id="overrideReason" rows={2} value={form.overrideReason} onChange={(e) => set("overrideReason")(e.target.value)}
                  placeholder="e.g. Loss-leader for the new JAMB term"
                  className={`rounded-xl border p-3 text-sm outline-none focus:border-violet-500 ${err("overrideReason") ? "border-red-300" : "border-neutral-200"}`} />
                {err("overrideReason") && <p className="text-xs text-red-600">{err("overrideReason")}</p>}
              </div>
            </div>
          )}
        </Section>
      </div>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
        <QuotePanel
          quote={complete ? preview.data ?? null : null}
          currentPrice={Number(detail.program.current_price)}
          loading={preview.isFetching}
          message={previewMessage}
        />

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <label htmlFor="template-change-reason" className="text-sm font-semibold text-neutral-900">Why are these costs changing?</label>
          <textarea id="template-change-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder={detail.version ? "e.g. Teacher rate rose for the new term" : "e.g. First costing from the 2026 budget"}
            className="mt-2 w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-violet-500" />
          {saveError && (
            <div className="mt-2 text-xs text-red-600">
              <p>{saveError.message}</p>
              {saveError.conflict && (
                <button type="button" onClick={() => window.location.reload()} className="mt-1 font-semibold underline">
                  Load the latest version
                </button>
              )}
            </div>
          )}
          <button type="button" onClick={handleSave} disabled={save.isPending || unchanged}
            className="mt-4 w-full rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
            {save.isPending ? "Saving…" : unchanged ? "No changes to save" : `Save as version ${(detail.version?.version_number ?? 0) + 1}`}
          </button>
          <p className="mt-2 text-xs text-neutral-400">Saving doesn&apos;t change what students pay. Prices apply once published.</p>
        </div>
      </aside>
    </div>
    <PublishPanel programType={programType} programId={programId} edition={edition}
      savedVersion={detail.version?.version_number ?? null} unsavedChanges={detail.version !== null && !unchanged} />
    </>
  );
}

function DirectCostsEditor({lines, onChange, errors}: {
  lines: DirectCostForm[];
  onChange: (lines: DirectCostForm[]) => void;
  errors: TemplateErrors;
}) {
  const update = (key: string, patch: Partial<DirectCostForm>) =>
    onChange(lines.map((l) => (l.key === key ? {...l, ...patch} : l)));
  const cell = "rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-900 outline-none focus:border-violet-500";

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-neutral-400">
              <th className="pb-2 pr-2 font-medium">Category</th>
              <th className="pb-2 pr-2 font-medium">Description</th>
              <th className="pb-2 pr-2 font-medium">Per enrolment</th>
              <th className="pb-2 pr-2 font-medium">In</th>
              <th className="pb-2 pr-2 font-medium" title="Whether MCC pays VAT on this cost">VAT paid</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.key} className="align-top">
                <td className="py-1.5 pr-2">
                  <select aria-label={`Category for direct cost ${i + 1}`} value={l.category}
                    onChange={(e) => update(l.key, {category: e.target.value as DirectCostCategory})} className={`${cell} w-40`}>
                    <option value="">Choose…</option>
                    {DIRECT_COST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </td>
                <td className="py-1.5 pr-2">
                  <input aria-label={`Description for direct cost ${i + 1}`} value={l.label}
                    onChange={(e) => update(l.key, {label: e.target.value})} className={`${cell} w-full min-w-40`} />
                  {errors[`cost-${l.key}`] && <p className="mt-1 text-xs text-red-600">{errors[`cost-${l.key}`]}</p>}
                </td>
                <td className="py-1.5 pr-2">
                  <input aria-label={`Amount for direct cost ${i + 1}`} inputMode="decimal" value={l.amount} placeholder="0"
                    onChange={(e) => update(l.key, {amount: e.target.value})} className={`${cell} w-28 tabular-nums`} />
                </td>
                <td className="py-1.5 pr-2">
                  <select aria-label={`Currency for direct cost ${i + 1}`} value={l.currency}
                    onChange={(e) => update(l.key, {currency: e.target.value as "NGN" | "USD"})} className={`${cell} w-24`}>
                    <option value="NGN">₦ NGN</option>
                    <option value="USD">$ USD</option>
                  </select>
                </td>
                <td className="py-1.5 pr-2 text-center">
                  <input type="checkbox" aria-label={`VAT paid on direct cost ${i + 1}`} checked={l.vatable}
                    onChange={(e) => update(l.key, {vatable: e.target.checked})} className="mt-2.5 h-4 w-4 accent-violet-600" />
                </td>
                <td className="py-1.5 pt-2">
                  <button type="button" onClick={() => onChange(lines.filter((x) => x.key !== l.key))}
                    aria-label={`Remove direct cost ${i + 1}`} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600">
                    <Icon icon="ph:trash" size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => onChange([...lines, newDirectCost()])}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50">
        <Icon icon="ph:plus" size={14} />
        Add a cost
      </button>
    </div>
  );
}

function VersionHistory({programType, programId, edition}: {programType: ProgramType; programId: string; edition: Edition}) {
  const {data} = useTemplateVersions(programType, programId, edition);
  if (!data?.length) return null;
  return (
    <Section title="Version history" description="Saved versions never change. Published prices will record the version they were built on.">
      <ul className="divide-y divide-neutral-100">
        {data.map((v, i) => (
          <li key={v.version_id} className="py-3">
            <p className="text-sm font-semibold text-neutral-900">
              Version {v.version_number}
              {i === 0 && <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Current</span>}
            </p>
            <p className="mt-0.5 text-sm text-neutral-600 break-words">{v.change_reason}</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {v.created_by_name ?? "Unknown admin"} · {new Date(v.created_at).toLocaleString("en-NG", {day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit"})}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
