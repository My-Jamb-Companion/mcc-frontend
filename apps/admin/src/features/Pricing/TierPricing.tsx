"use client";

import Link from "next/link";
import {Icon} from "@mcc/ui";
import PricingNav from "./components/PricingNav";
import TierEditor from "./components/TierEditor";
import LocationAudit from "./components/LocationAudit";

/**
 * Pricing model build step 2 -- purchasing-power tiers.
 * See docs/pricing-model.md §4 (D2, D3) in the backend repo.
 */
export default function TierPricing() {
  return (
    <section className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/finance" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
            <Icon icon="ph:arrow-left" size={14} />
            Finance
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Tiers</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Students and parents pay according to the tier they pick at checkout. Each tier&apos;s
            multiplier adjusts the margin, never the cost of delivery.
          </p>
        </div>
        <PricingNav />
      </div>

      <TierEditor />
      <LocationAudit />
    </section>
  );
}
