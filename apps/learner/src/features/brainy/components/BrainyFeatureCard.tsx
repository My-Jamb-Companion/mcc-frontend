import {Icon, motion} from "@mcc/ui";
import {FeatureCardConfig} from "./Brainy";

export default function BrainyFeatureCard({
  feature,
  onSelect,
}: {
  feature: FeatureCardConfig;
  onSelect?: (id: string) => void;
}) {
  const isDisabled = !!feature.disabled;

  return (
    <motion.button
      type="button"
      onClick={() => !isDisabled && onSelect?.(feature.id)}
      disabled={isDisabled}
      whileHover={!isDisabled ? {y: -2} : undefined}
      whileTap={!isDisabled ? {scale: 0.99} : undefined}
      transition={{type: "spring", stiffness: 400, damping: 28}}
      className={[
        "relative flex flex-1 flex-col items-start gap-3 rounded-2xl border bg-white dark:bg-subtle/10 shadow-md p-4 text-left",
        "border-gray-200 shadow-sm",
        isDisabled
          ? "cursor-default opacity-90"
          : "cursor-pointer hover:border-gray-300 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="flex w-full items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
          <Icon icon={feature.icon} className="h-4.5 w-4.5 text-purple-600" />
        </span>

        {feature.badge && (
          <span className="flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">
            <Icon icon="ph:sparkle-fill" className="h-3 w-3" />
            {feature.badge}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
        <p className="mt-1 text-sm leading-snug text-gray-500">
          {feature.description}
        </p>
      </div>
    </motion.button>
  );
}
