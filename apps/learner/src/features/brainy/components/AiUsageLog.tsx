"use client";

import {Icon, motion, AnimatePresence} from "@mcc/ui";
import {useMemo, useState} from "react";
import {ChatMessage} from "../contexts/BrainyContext";
import {useUsageSummary} from "../hooks/useBrainyChat";
import {describeCharge} from "../helper/charge";

/**
 * Per-job token accounting for a thread.
 *
 * Every completion reports what it cost, and that was previously thrown away
 * -- so nothing explained why a request was throttled or which questions are
 * expensive. While the provider tier is capped this is the difference between
 * "Brainy is broken" and "that document cost 3,400 tokens"; once it isn't,
 * the same numbers are the measured basis for usage tiers.
 */

const nf = new Intl.NumberFormat();

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function formatLatency(ms?: number | null) {
  if (ms == null) return null;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

/** Compact per-message footer: the cost of the answer directly above it. */
export function MessageUsage({message}: {message: ChatMessage}) {
  const usage = message.usage;
  if (!usage) return null;

  const latency = formatLatency(usage.latency_ms);
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1">
        <Icon icon="ph:coins" className="h-3 w-3" />
        {nf.format(usage.total_tokens)} tokens
      </span>
      <span className="opacity-70">
        {nf.format(usage.prompt_tokens)} in · {nf.format(usage.completion_tokens)} out
      </span>
      {latency && <span className="opacity-70">{latency}</span>}
      {describeCharge(message.charge) && (
        <span className={message.charge?.gems_charged ? "text-primary" : "opacity-70"}>
          {describeCharge(message.charge)}
        </span>
      )}
      {/* Only worth surfacing when it wasn't a clean single call -- that is
          what explains an otherwise inexplicable wait. */}
      {usage.attempts != null && usage.attempts > 1 && (
        <span className="text-amber-600 dark:text-amber-500">
          {usage.attempts} attempts
        </span>
      )}
    </div>
  );
}

/**
 * The expandable log. Collapsed it is a single summary line, so it never
 * competes with the conversation; expanded it lists every job in the thread.
 */
export default function AiUsageLog({messages}: {messages: ChatMessage[]}) {
  const [open, setOpen] = useState(false);
  const {summary} = useUsageSummary();

  const jobs = useMemo(
    () => messages.filter((m) => m.sender === "ai" && m.usage),
    [messages],
  );

  const threadTotal = useMemo(
    () => jobs.reduce((sum, m) => sum + (m.usage?.total_tokens ?? 0), 0),
    [jobs],
  );

  // A thread whose answers all predate token accounting has nothing to show;
  // an empty panel would just be noise.
  if (jobs.length === 0) return null;

  return (
    <div className="mx-auto w-[90%] max-sm:w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-muted transition-colors hover:bg-muted/10"
      >
        <Icon
          icon={open ? "ph:caret-down" : "ph:caret-right"}
          className="h-3 w-3 shrink-0"
        />
        <Icon icon="ph:pulse" className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">AI log</span>
        <span className="opacity-70">
          {plural(jobs.length, "job")} · {nf.format(threadTotal)} tokens in
          this chat
        </span>
        {summary && (
          <span className="ml-auto hidden opacity-70 sm:inline">
            {nf.format(summary.tokens_today)} today
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{opacity: 0, height: 0}}
            animate={{opacity: 1, height: "auto"}}
            exit={{opacity: 0, height: 0}}
            transition={{duration: 0.18}}
            className="overflow-hidden"
          >
            <div className="mt-1 rounded-xl border border-muted/20 bg-background p-2 shadow-sm">
              {/* Scrolls on its own rather than pushing the composer around. */}
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="text-muted">
                    <tr>
                      <th className="px-2 py-1 font-medium">Job</th>
                      <th className="px-2 py-1 text-right font-medium">In</th>
                      <th className="px-2 py-1 text-right font-medium">Out</th>
                      <th className="px-2 py-1 text-right font-medium">Total</th>
                      <th className="px-2 py-1 text-right font-medium">Time</th>
                      <th className="px-2 py-1 text-right font-medium">Paid with</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {jobs.map((m, i) => (
                      <tr key={m.id} className="border-t border-muted/15">
                        <td className="px-2 py-1">
                          <span className="text-muted">#{i + 1}</span>{" "}
                          <span className="opacity-80">
                            {m.usage?.model ?? "—"}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-right tabular-nums">
                          {nf.format(m.usage?.prompt_tokens ?? 0)}
                        </td>
                        <td className="px-2 py-1 text-right tabular-nums">
                          {nf.format(m.usage?.completion_tokens ?? 0)}
                        </td>
                        <td className="px-2 py-1 text-right font-medium tabular-nums">
                          {nf.format(m.usage?.total_tokens ?? 0)}
                        </td>
                        <td className="px-2 py-1 text-right tabular-nums text-muted">
                          {formatLatency(m.usage?.latency_ms) ?? "—"}
                        </td>
                        <td className="px-2 py-1 text-right text-muted">
                          {describeCharge(m.charge) ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {summary && (
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 border-t border-muted/15 px-2 pt-1.5 text-[11px] text-muted">
                  <span>
                    Today: {nf.format(summary.tokens_today)} tokens ·{" "}
                    {plural(summary.jobs_today, "job")}
                  </span>
                  <span>
                    30 days: {nf.format(summary.tokens_30d)} tokens ·{" "}
                    {plural(summary.jobs_30d, "job")}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
