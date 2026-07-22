import {Icon} from "@mcc/ui";

type Stat = {
  key: string;
  label: string;
  icon: string;
  value: string;
  change: number; // positive or negative percentage
  comparisonLabel: string;
};

const STATS: Stat[] = [
  {
    key: "live-calls",
    label: "Live Calls",
    icon: "mdi:message-text-outline",
    value: "1,255",
    change: -34.9,
    comparisonLabel: "prev month",
  },
  {
    key: "calls-missed",
    label: "Calls Missed",
    icon: "mdi:timer-outline",
    value: "120",
    change: 24.2,
    comparisonLabel: "prev month",
  },
  {
    key: "call-hours",
    label: "Call hours",
    icon: "mdi:clock-outline",
    value: "927.34",
    change: 34.9,
    comparisonLabel: "last month",
  },
  {
    key: "revenue-gen",
    label: "Revenue Gen.",
    icon: "mdi:receipt-text-outline",
    value: "₦925k",
    change: 34.9,
    comparisonLabel: "last month",
  },
];

function ChangeBadge({change}: {change: number}) {
  const isPositive = change >= 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md pl-1.5 py-0.5 text-sm font-medium border ${
        isPositive
          ? "bg-success/5 text-success border-success!"
          : "bg-danger/10 text-danger border-danger!"
      }`}
    >
      <Icon icon={isPositive ? "mdi:arrow-up" : "mdi:arrow-down"} size={16} />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export default function StatsSummaryRow() {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl px-2">
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {STATS.map((stat, index) => {
          const isLast = index === STATS.length - 1;

          return (
            <>
              <div
                key={stat.key}
                className={`px-5 py-5 ${!isLast ? "sm:border-r border-gray-100" : ""}`}
              >
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <Icon icon={stat.icon} size={16} className="text-gray-400" />
                  <span>{stat.label}</span>
                </div>

                <div className="flex items-center gap-6 flex-wrap ">
                  <span className="text-4xl font-semibold">{stat.value}</span>

                  <div className="flex flex-col gap-1.5 text-xs mt-1">
                    <ChangeBadge change={stat.change} />
                    <p>
                      <span className="text-muted">vs </span>
                      <span className="font-medium">
                        {stat.comparisonLabel}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}
