"use client";

import {Icon} from "@mcc/ui";
import {programBenefits, programFacts, type ProgramKind} from "@/src/features/courses/helper/programBenefits";
import type {ApiFormatOffer, LiveFormat} from "@/src/features/courses/helper/liveFormats";

interface WhatYouGetProps {
  kind: ProgramKind;
  formats: ApiFormatOffer[];
  format: LiveFormat | null;
}

/**
 * What the buyer is signing up for: the length and live sessions of the way of learning they have picked, then
 * everything that comes with it. Duration and sessions are what the admin entered for the program, so the page
 * and the console cannot disagree.
 */
export function WhatYouGet({kind, formats, format}: WhatYouGetProps) {
  const offer = formats.find((f) => f.format === format);
  const facts = programFacts(offer, format);
  const benefits = programBenefits(kind, format, offer);

  return (
    <section aria-labelledby="what-you-get" className="flex flex-col gap-4 rounded-2xl border border-muted/25 p-4">
      <h2 id="what-you-get" className="text-sm font-semibold">
        What you get
      </h2>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-xl bg-primary/5 px-3 py-2">
              <dt className="text-xs text-subtle">{fact.label}</dt>
              <dd className="text-lg font-bold leading-tight">{fact.value}</dd>
              {fact.note && <p className="text-xs text-subtle">{fact.note}</p>}
            </div>
          ))}
        </dl>
      )}

      <ul className="flex flex-col gap-2">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm">
            <Icon icon="ri:check-line" size={18} className="mt-0.5 shrink-0 text-primary" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
