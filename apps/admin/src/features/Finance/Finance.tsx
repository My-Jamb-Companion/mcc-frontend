"use client";

import Link from "next/link";
import {Icon} from "@mcc/ui";
import FinancialOverview from "./Overview";
import IncomeandPayoutschart from "./IncomeAndPayouts";
import PerformanceByProgramsChart from "./Performance";
import FinancialHealthCard from "./Health";
import {
  FinanceProgramOverviewTable,
  ProgramOverviewItem,
  StudentOverviewItem,
} from "./FinanceProgramsOverview";
import {useState} from "react";
import StudentFinanceViewModal from "./StudentFinanceViewModal";
import ProgramFinanceViewModal from "./ProgramFinanceViewModal";
import {PayoutsAndRefunds} from "./PayoutsAndRefunds";
import {
  useMonthlyFlow,
  useProgramRevenue,
  useRecentPayments,
} from "./hooks/useFinance";
import {
  computeFinancialHealth,
  fromApiMonthlyFlow,
  fromApiProgramRevenueToOverview,
  fromApiProgramRevenueToPerformance,
  fromApiRecentPayments,
} from "./helper/finance.mapper";

export default function Finance() {
  const [viewStudent, setViewStudent] = useState<StudentOverviewItem | null>(
    null,
  );
  const [viewPrograms, setViewPrograms] = useState<ProgramOverviewItem | null>(
    null,
  );

  const {data: monthlyFlow, isLoading: monthlyFlowLoading} = useMonthlyFlow(12);
  const {data: programRevenue, isLoading: programRevenueLoading} =
    useProgramRevenue(10);
  const {data: recentPayments} = useRecentPayments(20);

  const monthlyFlowData = monthlyFlow ? fromApiMonthlyFlow(monthlyFlow) : [];
  const programOverviewData = programRevenue
    ? fromApiProgramRevenueToOverview(programRevenue)
    : [];
  const programPerformanceData = programRevenue
    ? fromApiProgramRevenueToPerformance(programRevenue)
    : [];
  const studentOverviewData = recentPayments
    ? fromApiRecentPayments(recentPayments)
    : [];
  const financialHealth = computeFinancialHealth(monthlyFlowData);

  return (
    <section>
      <div className="mb-6 flex justify-end gap-2">
        <Link
          href="/finance/pricing/finance-summary"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
        >
          <Icon icon="ph:receipt" size={16} />
          Finance summary
        </Link>
        <Link
          href="/finance/pricing"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
        >
          <Icon icon="ph:sliders-horizontal" size={16} />
          Pricing parameters
        </Link>
      </div>
      <FinancialOverview />
      <div className="grid grid-cols-2 gap-4 py-6">
        <IncomeandPayoutschart
          data={monthlyFlowLoading ? [] : monthlyFlowData}
          currencySymbol="₦"
        />
        <PerformanceByProgramsChart
          isLoading={programRevenueLoading}
          currencySymbol="₦"
          data={programPerformanceData}
        />
      </div>
      <div className="py-2">
        <PayoutsAndRefunds />
      </div>

      <div className="flex gap-4">
        <FinanceProgramOverviewTable
          studentData={studentOverviewData}
          programData={programOverviewData}
          setViewStudent={setViewStudent}
          setViewPrograms={setViewPrograms}
        />

        <FinancialHealthCard
          statusLabel={financialHealth.isHealthy ? "On track" : "Needs attention"}
          statusTone={financialHealth.isHealthy ? "success" : "danger"}
          amount={Math.max(0, financialHealth.netThisMonth)}
          currencySymbol="₦"
          changePercent={financialHealth.changePercent}
          ringValueLabel={`${financialHealth.savedPercent}%`}
          ringCaption="Of monthly income saved"
          ringSegments={[
            {
              upTo: Math.max(0, Math.min(100, financialHealth.savedPercent)),
              color: financialHealth.isHealthy ? "#4F3FE0" : "#B33333",
            },
          ]}
        />
      </div>
      <StudentFinanceViewModal
        student={viewStudent}
        onClose={() => setViewStudent(null)}
      />
      <ProgramFinanceViewModal
        program={viewPrograms}
        onClose={() => setViewPrograms(null)}
      />
    </section>
  );
}
