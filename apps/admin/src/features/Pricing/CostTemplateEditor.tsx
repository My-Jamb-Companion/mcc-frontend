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
  EDITION_LABELS,
  EDITIONS,
  emptyTemplateForm,
  GROUP_SEATS,
  newDirectCost,
  TemplateErrors,
  TemplateForm,
  templateFormFromVersion,
  templateInput,
  teachingCostPerStudent,
  validateTemplate,
} from "./helper/templateForm";
import {useProgramTemplate, useQuotePreview, useSaveProgramTemplate, useTemplateVersions} from "./hooks/useTemplates";
import type {ApiFormat, ApiProgramTemplate, DirectCostCategory, Edition, ProgramType} from "./services/templates.service";
import {pricingErrorMessage} from "./services/pricing.service";

const naira = (v: string | number) => `₦${new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0}).format(Number(v))}`;

/**
 * Pricing model build step 3 -- a program's cost template and its price in every tier, for each way a student
 * can take it: self-paced, a live group of five, or live one-to-one. The costs are shared; the formats differ in
 * how the teacher's time is divided. Prices are recalculated by the server as the admin types.
 */
export default function CostTemplateEditor({
  programType,
  programId,
  initialEdition,
}: {
  programType: ProgramType;
  programId: string;
  initialEdition: Edition;
}) {
  const {data, isLoading, isError, error, refetch} = useProgramTemplate(programType, programId);

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
                {programType === "course" ? "Course" : "Exam program"} · charged today:{" "}
                {Number(data.program.current_price) > 0 ? naira(data.program.current_price) : "free"}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${data.version?.version_number ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
              {data.version?.version_number ? `Version ${data.version.version_number}` : "Not costed yet"}
            </span>
          </div>
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
          <TemplateEditorForm key={data.version?.version_number ?? "new"} detail={data}
            programType={programType} programId={programId} initialEdition={initialEdition} />
          <VersionHistory programType={programType} programId={programId} edition={data.history_edition} />
        </>
      )}
    </section>
  );
}

/** One tab per format with what it would cost the student, so the three can be compared at a glance. */
function FormatTabs({formats, selected, onSelect}: {formats: ApiFormat[]; selected: Edition; onSelect: (e: Edition) => void}) {
  return (
    <div role="tablist" aria-label="Live-teaching format" className="grid gap-2 sm:grid-cols-3">
      {EDITIONS.map((e) => {
        const f = formats.find((x) => x.edition === e);
        const tier = f?.quote?.tiers.find((t) => t.is_default) ?? f?.quote?.tiers[0];
        const active = e === selected;
        return (
          <button key={e} type="button" role="tab" aria-selected={active} onClick={() => onSelect(e)}
            className={`rounded-xl border p-3 text-left transition-colors ${active ? "border-violet-500 bg-violet-50/60" : "border-neutral-200 bg-white hover:bg-neutral-50"}`}>
            <p className="text-sm font-semibold text-neutral-900">{EDITION_LABELS[e]}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {f && !f.applicable
                ? "Needs live sessions"
                : tier
                  ? `Costs the student ${naira(tier.student_pays)}`
                  : "No price yet"}
              {f?.published_price ? ` · on sale at ${naira(f.published_price)}` : ""}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function TemplateEditorForm({detail, programType, programId, initialEdition}: {
  detail: ApiProgramTemplate;
  programType: ProgramType;
  programId: string;
  initialEdition: Edition;
}) {
  const [form, setForm] = useState<TemplateForm>(() =>
    detail.version ? templateFormFromVersion(detail.version) : emptyTemplateForm(programType),
  );
  const [edition, setEdition] = useState<Edition>(initialEdition);
  const [reason, setReason] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<{message: string; conflict: boolean} | null>(null);

  const errors = useMemo(() => validateTemplate(form), [form]);
  const complete = Object.keys(errors).length === 0;
  const input = useMemo(() => (complete ? templateInput(form) : null), [complete, form]);

  const preview = useQuotePreview(programType, programId, input);
  const save = useSaveProgramTemplate(programType, programId);

  const savedInput = useMemo(
    () => (detail.version ? JSON.stringify(templateInput(templateFormFromVersion(detail.version))) : null),
    [detail.version],
  );
  const unchanged = input !== null && savedInput === JSON.stringify(input);

  const set = <K extends keyof TemplateForm>(key: K) => (value: TemplateForm[K]) => setForm((f) => ({...f, [key]: value}));
  const err = (key: keyof TemplateForm) => (showErrors ? errors[key] : undefined);
  const setCeiling = (e: Edition) => (value: string) => setForm((f) => ({...f, ceilings: {...f.ceilings, [e]: value}}));

  // Until the figures are complete, tabs show what was last saved; after that, the server's live preview.
  const formats = (complete ? preview.data : null) ?? detail.formats;
  const current = formats.find((f) => f.edition === edition);

  // The preview shows the server's own objection (format rules, a margin that
  // leaves nothing for costs, missing company parameters) rather than a guess.
  const previewMessage = !complete
    ? "Fill in the figures to see prices."
    : preview.isError
      ? pricingErrorMessage(preview.error, "Prices couldn't be worked out.")
      : current?.quote_unavailable_reason ?? null;

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
  const groupCost = teachingCostPerStudent(form, "group");
  const oneCost = teachingCostPerStudent(form, "one_to_one");

  return (
    <>
    <FormatTabs formats={formats} selected={edition} onSelect={setEdition} />
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Section title="Live teaching"
          description={`Students choose at signup whether to learn self-paced, in a live group of ${GROUP_SEATS}, or one-to-one. The live sessions, their length and the teacher's pay are shared by the two live formats; the difference is who the teacher's time is divided between. Use 0 sessions for a program with no live teaching.`}>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="liveSessions" label="Live sessions per enrolment" value={form.liveSessions} onChange={set("liveSessions")} error={err("liveSessions")} />
            <NumberField id="hoursPerSession" label="Hours per session" value={form.hoursPerSession} onChange={set("hoursPerSession")} error={err("hoursPerSession")} disabled={!hasSessions} />
            <NumberField id="hourlyRate" label="Teacher pay per hour" prefix="₦" value={form.hourlyRate} onChange={set("hourlyRate")} error={err("hourlyRate")} disabled={!hasSessions} />
          </div>
          <dl className="mt-4 grid gap-3 rounded-xl bg-neutral-50 p-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-neutral-500">Self-paced</dt>
              <dd className="font-semibold tabular-nums text-neutral-900">{naira(0)} teaching</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Live group · shared by {GROUP_SEATS}</dt>
              <dd className="font-semibold tabular-nums text-neutral-900">{groupCost === null ? "—" : `${naira(groupCost)} per student`}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Live 1-to-1 · one student</dt>
              <dd className="font-semibold tabular-nums text-neutral-900">{oneCost === null ? "—" : `${naira(oneCost)} per student`}</dd>
            </div>
          </dl>
        </Section>

        <Section title="Other direct costs per enrolment"
          description="What each additional student costs to serve, besides teaching: Brainy AI usage, messaging, hosting and video, ads per enrolment, mock-exam marking, materials. Dollar amounts convert at the company exchange rate plus buffer.">
          <DirectCostsEditor lines={form.directCosts} onChange={set("directCosts")} errors={showErrors ? errors : {}} />
          <div className="mt-4 max-w-sm">
            <NumberField id="aiMonths" label="Months the AI usage cost covers" value={form.aiMonths} onChange={set("aiMonths")}
              error={err("aiMonths")}
              hint="Each student's Brainy allowance is the AI cost's tokens spread over these months" />
          </div>
        </Section>

        <Section title="Development"
          description={`The one-off cost of building this ${programType === "course" ? "course" : "program"} — development teachers' pay and any equipment bought for it — spread across the students expected over its life, in any format. Fewer expected students means more per student.`}>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="developmentCost" label="Development cost" prefix="₦" value={form.developmentCost} onChange={set("developmentCost")} error={err("developmentCost")} />
            <NumberField id="periods" label={periodLabel} value={form.periods} onChange={set("periods")} error={err("periods")} />
            <NumberField id="enrolmentsPerPeriod" label={perPeriodLabel} value={form.enrolmentsPerPeriod} onChange={set("enrolmentsPerPeriod")} error={err("enrolmentsPerPeriod")} />
          </div>
        </Section>

        <Section title="Market ceilings"
          description="The most students will realistically pay for each format, VAT included. A format can't be published while any tier's price is above its ceiling — a sign to rethink the costs, class size or expected enrolments rather than charge more than the market bears.">
          <div className="grid gap-4 sm:grid-cols-3">
            {EDITIONS.map((e) => {
              const unavailable = e !== "self_paced" && !hasSessions;
              return (
                <NumberField key={e} id={`ceiling-${e}`} label={EDITION_LABELS[e]} prefix="₦" value={form.ceilings[e]}
                  onChange={setCeiling(e)} error={showErrors ? errors[`ceiling-${e}`] : undefined} disabled={unavailable}
                  hint={unavailable ? "Needs live sessions" : "Needed before publishing"} />
              );
            })}
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
          formatLabel={EDITION_LABELS[edition]}
          quote={complete ? current?.quote ?? null : null}
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
          <p className="mt-2 text-xs text-neutral-400">Saves every format together. It doesn&apos;t change what students pay; prices apply once published.</p>
        </div>
      </aside>
    </div>
    {current && !current.applicable ? (
      <Section title="Publish prices" description={`${EDITION_LABELS[edition]} isn't offered while this program has no live sessions. Add live sessions above to cost and publish it.`}>
        <p className="text-sm text-neutral-500">Nothing to publish for this format.</p>
      </Section>
    ) : (
      <PublishPanel key={edition} programType={programType} programId={programId} edition={edition}
        formatLabel={EDITION_LABELS[edition]}
        savedVersion={current?.version_number ?? null} unsavedChanges={detail.version !== null && !unchanged} />
    )}
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
