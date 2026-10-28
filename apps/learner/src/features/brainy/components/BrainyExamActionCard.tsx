"use client";

import {motion} from "framer-motion";
import {Icon} from "@mcc/ui";

export interface ActionCardConfig {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
  /** Stands out from the other cards: a solid brand background. */
  highlight?: boolean;
}

export interface ActionCardGridProps {
  eyebrow?: string;
  heading: string;
  subtext?: string;
  actions: ActionCardConfig[];
  onSelect?: (id: string) => void;
  columns?: 2 | 3;
  className?: string;
}

function ActionCard({
  action,
  onSelect,
}: {
  action: ActionCardConfig;
  onSelect?: (id: string) => void;
}) {
  const isDisabled = !!action.disabled;
  const highlight = !!action.highlight;

  return (
    <motion.button
      type="button"
      onClick={() => !isDisabled && onSelect?.(action.id)}
      disabled={isDisabled}
      whileHover={!isDisabled ? {y: -2} : undefined}
      whileTap={!isDisabled ? {scale: 0.99} : undefined}
      transition={{type: "spring", stiffness: 400, damping: 28}}
      className={[
        "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left",
        highlight ? "border-primary bg-primary shadow-md" : "border-muted/20 bg-background shadow-sm",
        isDisabled
          ? "cursor-default opacity-90"
          : highlight
            ? "cursor-pointer hover:shadow-lg hover:brightness-110"
            : "cursor-pointer hover:border-muted/30 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 ${
          highlight ? "border-white/30 bg-white/20" : "border-muted/20 bg-muted/10"
        }`}
      >
        <Icon icon={action.icon} className={`h-4.5 w-4.5 ${highlight ? "text-white" : "text-purple-600"}`} />
      </span>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-sm font-semibold ${highlight ? "text-white" : "text-foreground"}`}>
            {action.title}
          </h3>
          {action.badge && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">
              <Icon icon="ph:sparkle-fill" className="h-3 w-3" />
              {action.badge}
            </span>
          )}
        </div>
        <p className={`mt-0.5 text-sm leading-snug ${highlight ? "text-white/85" : "text-subtle"}`}>
          {action.description}
        </p>
      </div>
    </motion.button>
  );
}

export function BrainyExamActionCardGrid({
  eyebrow,
  heading,
  subtext,
  actions,
  onSelect,
  columns = 2,
  className = "",
}: ActionCardGridProps) {
  const gridColsClass = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className={`mx-auto w-full max-w-[660px] ${className}`}>
      {eyebrow && (
        <span className="inline-flex rounded-full bg-muted/10 px-3 py-1 text-xs font-medium text-subtle mx-auto text-center">
          {eyebrow}
        </span>
      )}

      <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-[28px]">
        {heading}
      </h1>

      {subtext && <p className="mt-2 text-sm text-muted">{subtext}</p>}

      <div className={`mt-6 grid grid-cols-2 gap-3 ${gridColsClass}`}>
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export default BrainyExamActionCardGrid;
