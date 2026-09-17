"use client";

import {Icon} from "@mcc/ui";
import {allowanceSummary} from "../helper/charge";
import {useAllowance} from "../hooks/useBrainyChat";

/**
 * What the student has left before Brainy costs gems: today's free tokens,
 * this month's allowance from their courses, and their gems. Hidden when
 * Brainy isn't metered for them.
 */
export default function AllowanceMeter({className = ""}: {className?: string}) {
  const {allowance} = useAllowance();
  const summary = allowanceSummary(allowance);
  if (!summary || !allowance) return null;

  const empty =
    (allowance.free_left_today ?? 0) <= 0 && (allowance.allowance_left_this_month ?? 0) <= 0;
  const gemsNote =
    allowance.gems > 0 ? ` (${allowance.earned_gems} earned, ${allowance.purchased_gems} bought)` : "";

  return (
    <p
      className={`flex items-center gap-1.5 px-2 text-[11px] ${empty ? "text-amber-600 dark:text-amber-500" : "text-muted"} ${className}`}
      title={
        allowance.tokens_per_gem
          ? `After your free and monthly tokens, each ${allowance.tokens_per_gem.toLocaleString()} tokens cost 1 gem. Earned gems are used first.`
          : undefined
      }
    >
      <Icon icon="ph:gauge" className="h-3.5 w-3.5 shrink-0" />
      <span>
        {summary}
        {gemsNote}
        {empty && allowance.gems > 0 && " — answers now cost gems"}
      </span>
    </p>
  );
}
