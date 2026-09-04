import {CreditCard, Landmark, ChevronDown} from "lucide-react";

export default function FinancialOverview() {
  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Overall Balance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900 font-semibold text-base">
                Overall Balance
              </h3>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium">
                All time <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">
                Accrued Balance
              </p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  ₦200,211, 503
                </span>
                <span className="text-sm font-semibold text-gray-500">.00</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="inline-flex items-center gap-2 bg-emerald-50/60 px-3 py-1.5 rounded-lg text-xs w-full">
              <CreditCard className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-gray-600 font-medium">
                Total earned from cards
              </span>
              <span className="text-emerald-600 font-bold ml-auto">
                +₦90,200,929
              </span>
            </div>

            <div className="inline-flex items-center gap-2 bg-emerald-50/60 px-3 py-1.5 rounded-lg text-xs w-full">
              <Landmark className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-gray-600 font-medium">
                Total earned from transfer
              </span>
              <span className="text-emerald-600 font-bold ml-auto">
                +₦110,200,929
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: MCC Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900 font-semibold text-base">
                MCC Revenue
              </h3>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium">
                July 2026 <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  ₦90,211, 503
                </span>
                <span className="text-sm font-semibold text-gray-500">.00</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div className="border-l-2 border-blue-500 pl-3 space-y-1">
              <p className="text-xs text-gray-500 font-medium">
                Exam prog income
              </p>
              <p className="text-lg font-bold text-gray-900">₦20.8m</p>
            </div>

            <div className="border-l-2 border-indigo-600 pl-3 space-y-1">
              <p className="text-xs text-gray-500 font-medium">Course income</p>
              <p className="text-lg font-bold text-gray-900">₦70.8m</p>
            </div>
          </div>
        </div>

        {/* Card 3: Teachers Payout */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900 font-semibold text-base">
                Teachers Payout
              </h3>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-medium">Total Payout</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  ₦110,211, 503
                </span>
                <span className="text-sm font-semibold text-gray-500">.00</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div className="border-l-2 border-blue-500 pl-3 space-y-1">
              <p className="text-xs text-gray-500 font-medium">
                Exam prog payout
              </p>
              <p className="text-lg font-bold text-gray-900">₦30.8m</p>
            </div>

            <div className="border-l-2 border-indigo-600 pl-3 space-y-1">
              <p className="text-xs text-gray-500 font-medium">Course payout</p>
              <p className="text-lg font-bold text-gray-900">₦80.2m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
