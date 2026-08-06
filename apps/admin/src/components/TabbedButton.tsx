import {motion} from "@mcc/ui";

export default function TabbedButton({
  active,
  onChange,
  tabs,
}: {
  active: string;
  onChange: (key: string) => void;
  tabs: {key: string; label: string}[];
}) {
  return (
    <div className="inline-flex rounded-full bg-gray-100 p-1">
      {tabs.map((t) => {
        const isActive = active === t.key;

        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className="relative rounded-full px-4 py-1.5 text-sm font-semibold focus:ring-2 ring-primary/50 focus:ring-primary/30 outline-0"
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-full border border-muted/30 bg-white shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}

            <motion.span
              animate={{
                color: isActive ? "#111827" : "#9CA3AF",
              }}
              transition={{duration: 0.2}}
              className="relative z-10"
            >
              {t.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
