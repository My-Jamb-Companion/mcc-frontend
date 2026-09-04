import React from "react";
import FinancialOverview from "./Overview";
import IncomeandPayoutschart from "./IncomeAndPayouts";
import PerformanceByProgramsChart from "./Performance";

export default function Finance() {
  return (
    <section>
      <FinancialOverview />
      <div className="grid grid-cols-2 gap-4">
        <IncomeandPayoutschart data={monthlyFlowData} currencySymbol="₦" />
        <PerformanceByProgramsChart
          //   isLoading={isPending}
          currencySymbol="₦"
          data={[
            {id: "1", label: "Maths", sublabel: "UTME", value: 20_810_000},
            {id: "2", label: "English", sublabel: "WAEC", value: 12_220_000},
            {id: "3", label: "Biology", sublabel: "UTME", value: 9_370_000},
            {
              id: "4",
              label: "Pilates Teacher Training Certi...",
              sublabel: "Pilates",
              value: 10_220_000,
              iconUrl: "/avatars/trainer1.jpg",
            },
            {
              id: "6",
              label: "Pilates Teacher Training Certi...",
              sublabel: "Pilates",
              value: 12_220_000,
              iconUrl: "/avatars/trainer1.jpg",
            },
            {
              id: "5",
              label: "Pilates Teacher Training Certif...",
              sublabel: "Acrobatics",
              value: 9_920_000,
              iconUrl: "/avatars/trainer2.jpg",
            },
          ]}
        />
      </div>
    </section>
  );
}

const monthlyFlowData = [
  {month: "Jan", income: 18_400_000, payout: 24_100_000},
  {month: "Feb", income: 16_900_000, payout: 22_600_000},
  {month: "Mar", income: 12_300_000, payout: 21_800_000},
  {month: "Apr", income: 20_800_000, payout: 32_500_000},
  {month: "May", income: 15_700_000, payout: 26_400_000},
  {month: "Jun", income: 19_600_000, payout: 25_900_000},
  {month: "Jul", income: 16_500_000, payout: 26_700_000},
  {month: "Aug", income: 21_200_000, payout: 27_100_000},
  {month: "Sep", income: 14_800_000, payout: 21_500_000},
  {month: "Oct", income: 14_500_000, payout: 21_200_000},
  {month: "Nov", income: 14_900_000, payout: 21_800_000},
  {month: "Dec", income: 18_800_000, payout: 23_600_000},
];
