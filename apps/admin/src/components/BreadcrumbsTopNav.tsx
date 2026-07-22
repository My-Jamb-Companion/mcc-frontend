"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {Fragment} from "react";

type BreadcrumbsProps = {
  /**
   * Optional overrides for how a URL segment should be displayed.
   * Key is the raw segment (e.g. "exam-program"), value is the label to show.
   * Falls back to auto-formatting (hyphens/underscores -> spaces, title case)
   * when a segment isn't listed here.
   */
  labelMap?: Record<string, string>;
  className?: string;
};

function formatSegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function BreadcrumbsTopNav({
  labelMap = {},
  className = "",
}: BreadcrumbsProps) {
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    label: labelMap[segment] ?? formatSegment(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={className + "px-6 py-4.5 border-b border-muted/30"}
    >
      <ol className="flex items-center gap-2 text-[15px]">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={crumb.href}>
              {index > 0 && (
                <li className="text-gray-300" aria-hidden="true">
                  /
                </li>
              )}
              <li>
                {isLast ? (
                  <span className="text-gray-400">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="font-medium text-gray-900 hover:text-black transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
