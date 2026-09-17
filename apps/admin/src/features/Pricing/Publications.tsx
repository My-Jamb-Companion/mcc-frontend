"use client";

import Link from "next/link";
import {useState} from "react";
import {Icon} from "@mcc/ui";
import PricingNav from "./components/PricingNav";
import PublicationHistory from "./components/PublicationHistory";
import {usePublications} from "./hooks/usePublications";
import type {PublicationStatus} from "./services/publications.service";
import {pricingErrorMessage} from "./services/pricing.service";

const FILTERS: {value: PublicationStatus | undefined; label: string}[] = [
  {value: "pending", label: "Waiting for confirmation"},
  {value: "published", label: "Published"},
  {value: undefined, label: "All"},
];

/**
 * Pricing model build step 4 -- prices published across all programs, and the
 * queue of below-floor publications waiting for a second admin (D9).
 */
export default function Publications() {
  const [status, setStatus] = useState<PublicationStatus | undefined>("pending");
  const {data, isLoading, isError, error, refetch} = usePublications(status);

  return (
    <section className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/finance" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
            <Icon icon="ph:arrow-left" size={14} />
            Finance
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Price publications</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Every set of prices published for a course or exam program. A publication that sells any tier below its
            hard floor loses money on each sale, so it waits here until a second admin confirms or cancels it.
          </p>
        </div>
        <PricingNav />
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="inline-flex rounded-xl bg-neutral-100/80 p-1">
          {FILTERS.map((f) => (
            <button key={f.label} type="button" onClick={() => setStatus(f.value)} aria-pressed={status === f.value}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${status === f.value ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {isLoading ? (
            <p className="text-sm text-neutral-400">Loading publications…</p>
          ) : isError ? (
            <p className="text-sm text-red-600">
              {pricingErrorMessage(error, "Couldn't load publications.")}{" "}
              <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button>
            </p>
          ) : (
            <PublicationHistory publications={data ?? []} showProgram
              emptyText={status === "pending" ? "Nothing is waiting for confirmation." : "No publications yet."} />
          )}
        </div>
      </div>
    </section>
  );
}
