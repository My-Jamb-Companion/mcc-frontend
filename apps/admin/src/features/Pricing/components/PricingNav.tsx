"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

const TABS = [
  {href: "/finance/pricing", label: "Company parameters"},
  {href: "/finance/pricing/cities", label: "Cities & tiers"},
  {href: "/finance/pricing/programs", label: "Program pricing"},
  {href: "/finance/pricing/publications", label: "Publications"},
];

/** Switches between the pricing model's admin screens. */
export default function PricingNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Pricing" className="inline-flex w-fit items-center rounded-xl bg-neutral-100/80 p-1">
      {TABS.map((tab) => {
        // Program pricing has nested editor pages, which should keep its tab lit.
        const active = tab.href === "/finance/pricing/programs" ? pathname.startsWith(tab.href) : pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              active ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
