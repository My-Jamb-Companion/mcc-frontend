import {Icon} from "@mcc/ui";
import {useLiveSessionsOverview} from "../hooks/useLiveSessions";

type Stat = {
  key: string;
  label: string;
  icon: string;
  value: string;
};

export default function StatsSummaryRow({days = 30}: {days?: number}) {
  const {data: overview, isLoading} = useLiveSessionsOverview(days);

  const stats: Stat[] = [
    {
      key: "upcoming-sessions",
      label: "Upcoming Sessions",
      icon: "material-symbols:video-chat-outline",
      value: isLoading ? "—" : String(overview?.upcoming_sessions ?? 0),
    },
    {
      key: "total-sessions",
      label: "Total Sessions",
      icon: "mdi:calendar-multiple",
      value: isLoading ? "—" : String(overview?.total_sessions ?? 0),
    },
    {
      key: "total-calls",
      label: "Calls Joined",
      icon: "mdi:phone-outline",
      value: isLoading ? "—" : String(overview?.total_calls ?? 0),
    },
    {
      key: "revenue-gen",
      label: "Revenue Gen.",
      icon: "ri:wallet-line",
      value: isLoading ? "—" : String(overview?.total_revenue ?? 0),
    },
  ];

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl px-2">
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {stats.map((stat, index) => {
          const isLast = index === stats.length - 1;

          return (
            <div
              key={stat.key}
              className={`px-5 py-5 ${!isLast ? "sm:border-r border-gray-100" : ""}`}
            >
              <div className="flex items-center gap-1.5 text-xs mb-2">
                <Icon icon={stat.icon} size={16} />
                <span>{stat.label}</span>
              </div>

              <div className="flex items-center gap-6 flex-wrap ">
                <span className="text-4xl font-semibold">
                  {stat.key === "revenue-gen" && (
                    <sup className="text-lg text-muted/70">₦</sup>
                  )}
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
