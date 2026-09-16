"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {Icon} from "@mcc/ui";
import PricingNav from "./components/PricingNav";
import {usePricedPrograms} from "./hooks/useTemplates";
import type {ApiEditionSummary, ApiProgramSummary} from "./services/templates.service";
import {pricingErrorMessage} from "./services/pricing.service";

const naira = (v: string | number) => `₦${new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0}).format(Number(v))}`;

/**
 * Pricing model build step 3 -- every course and exam program with its
 * editions, and what each would cost at the default city tier.
 */
export default function ProgramPricing() {
  const {data, isLoading, isError, error, refetch} = usePricedPrograms();
  const [type, setType] = useState<"all" | "course" | "exam">("all");
  const [query, setQuery] = useState("");

  const programs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.programs ?? []).filter(
      (p) => (type === "all" || p.program_type === type) && (!q || p.title.toLowerCase().includes(q)),
    );
  }, [data, type, query]);

  const costed = (data?.programs ?? []).flatMap((p) => p.editions).filter((e) => e.latest_version).length;
  const total = (data?.programs ?? []).flatMap((p) => p.editions).length;

  return (
    <section className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/finance" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
            <Icon icon="ph:arrow-left" size={14} />
            Finance
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Program pricing</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            What each course and exam program costs to deliver and build, and the price that works out
            to in every city tier. Courses come in two editions; exam programs in one. Prices shown here
            aren&apos;t charged until they&apos;re published.
          </p>
        </div>
        <PricingNav />
      </div>

      {data && !data.parameters_configured && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <span>Company pricing parameters aren&apos;t set yet, so no program can be priced. Cost templates can still be saved.</span>
          <Link href="/finance/pricing" className="rounded-full bg-white px-4 py-2 font-medium text-amber-900 hover:bg-amber-100">
            Set company parameters
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input aria-label="Search programs" placeholder="Search programs" value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-56 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-violet-500" />
            <div className="inline-flex rounded-xl bg-neutral-100/80 p-1">
              {(["all", "course", "exam"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${type === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}>
                  {t === "all" ? "All" : t === "course" ? "Courses" : "Exam programs"}
                </button>
              ))}
            </div>
          </div>
          {data && <p className="text-sm text-neutral-500">{costed} of {total} editions costed</p>}
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-neutral-400">Loading programs…</p>
        ) : isError ? (
          <p className="mt-6 text-sm text-red-600">
            {pricingErrorMessage(error, "Couldn't load programs.")}{" "}
            <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button>
          </p>
        ) : programs.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-400">No programs match.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
                  <th className="pb-2 pr-3 font-medium">Program</th>
                  <th className="pb-2 pr-3 text-right font-medium">Charged today</th>
                  <th className="pb-2 pr-3 font-medium">Editions · default tier price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {programs.map((p) => <ProgramRow key={`${p.program_type}-${p.program_id}`} program={p} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function ProgramRow({program}: {program: ApiProgramSummary}) {
  return (
    <tr className="align-top">
      <td className="py-3 pr-3">
        <p className="font-semibold text-neutral-900">{program.title}</p>
        <p className="mt-0.5 text-xs text-neutral-400">
          {program.program_type === "course" ? "Course" : "Exam program"}
          {program.status ? ` · ${program.status}` : ""}
        </p>
      </td>
      <td className="py-3 pr-3 text-right tabular-nums text-neutral-700">
        {Number(program.current_price) > 0 ? naira(program.current_price) : "Free"}
      </td>
      <td className="py-3 pr-3">
        <div className="flex flex-wrap gap-2">
          {program.editions.map((e) => <EditionChip key={e.edition} program={program} edition={e} />)}
        </div>
      </td>
    </tr>
  );
}

function EditionChip({program, edition}: {program: ApiProgramSummary; edition: ApiEditionSummary}) {
  const href = `/finance/pricing/programs/${program.program_type}/${encodeURIComponent(program.program_id)}/${edition.edition}`;
  const name = edition.edition === "premium" ? "Premium" : "Standard";
  return (
    <Link href={href}
      className={`flex min-w-44 items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-colors hover:border-violet-400 ${
        edition.latest_version ? "border-neutral-200" : "border-dashed border-neutral-300"}`}>
      <span>
        <span className="block text-sm font-medium text-neutral-900">{name}</span>
        <span className="block text-xs text-neutral-400">
          {edition.latest_version ? `Version ${edition.latest_version}` : "Not costed yet"}
        </span>
      </span>
      <span className={`text-sm tabular-nums ${edition.default_tier_price ? "font-semibold text-neutral-900" : "text-violet-700"}`}>
        {edition.default_tier_price ? naira(edition.default_tier_price) : edition.latest_version ? "—" : "Set up"}
      </span>
    </Link>
  );
}
