import {
  Video,
  Clock,
  PhoneOff,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface MetricBadgeProps {
  change: string;
  isPositive: boolean;
  timeframe: string;
}

const TrendBadge: React.FC<MetricBadgeProps> = ({
  change,
  isPositive,
  timeframe,
}) => {
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-semibold ${
          isPositive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-rose-50 text-rose-500"
        }`}
      >
        <Icon className="h-3 w-3 stroke-[2.5]" />
        {change}
      </span>
      <span className="text-[11px] text-gray-400">vs {timeframe}</span>
    </div>
  );
};

export const Overview: React.FC = () => {
  return (
    <div>
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="font-mono text-base font-semibold text-gray-800">
          Overview
        </h2>
      </div>

      <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
          <div className="flex flex-col items-center justify-center text-center md:col-span-5">
            <span className="font-mono text-sm tracking-wide text-gray-400">
              Total Booked calls
            </span>
            <span className="mt-2 text-6xl font-bold tracking-tight text-gray-900">
              1,920
            </span>
          </div>

          <div className="relative grid grid-cols-1 gap-y-8 md:col-span-7 md:grid-cols-2 md:gap-x-12">
            <div className="hidden md:absolute md:inset-y-2 md:left-1/2 md:block md:w-[1px] md:-translate-x-1/2 md:bg-gray-100" />

            <div className="flex flex-col justify-between space-y-3 pb-4 md:border-b md:border-gray-100 md:pb-6">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <Video className="h-4 w-4 text-gray-600" />
                <span>Live Calls</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">1,255</span>
                <TrendBadge
                  change="34.9%"
                  isPositive={false}
                  timeframe="prev month"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-3 pb-4 md:border-b md:border-gray-100 md:pb-6">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <Clock className="h-4 w-4 text-gray-600" />
                <span>Call hours</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">927.34</span>
                <TrendBadge
                  change="34.9%"
                  isPositive={true}
                  timeframe="last month"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <PhoneOff className="h-4 w-4 text-gray-600" />
                <span>Calls Missed</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">120</span>
                <TrendBadge
                  change="24.2%"
                  isPositive={true}
                  timeframe="prev month"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <Receipt className="h-4 w-4 text-gray-600" />
                <span>Revenue Gen.</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">₦925k</span>
                <TrendBadge
                  change="34.9%"
                  isPositive={true}
                  timeframe="last month"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
