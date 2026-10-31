"use client";

import { programBenefits, programFacts, type ProgramKind } from "./benefits";
import type { CatalogueFormat, LiveFormat } from "./formats";

interface WhatYouGetProps {
  kind: ProgramKind;
  formats: CatalogueFormat[];
  format: LiveFormat | undefined;
}

/**
 * What the parent is paying for: the length and live sessions of the way of learning picked, then everything
 * that comes with it. Duration and sessions are what the admin entered for the program.
 */
export function WhatYouGet({ kind, formats, format }: WhatYouGetProps) {
  const offer = formats.find((f) => f.format === format);
  const facts = programFacts(offer, format);
  const benefits = programBenefits(kind, format, offer);

  return (
    <section className="space-y-3 rounded-lg border border-muted/20 px-3 py-3">
      <h4 className="text-xs font-medium text-muted">What your child gets</h4>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-lg bg-primary/5 px-3 py-2">
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className="text-base font-semibold leading-tight">{fact.value}</dd>
              {fact.note && <p className="text-xs text-muted">{fact.note}</p>}
            </div>
          ))}
        </dl>
      )}

      <ul className="space-y-1.5">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm">
            <span aria-hidden className="text-primary">✓</span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
