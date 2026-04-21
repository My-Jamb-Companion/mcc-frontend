import {Icon} from "@mcc/ui";
import {ExamsProps} from "../constants/examsCards";

export default function ExamCard({exam, onEnroll}: ExamsProps) {
  const WatermarkW = ({color}: {color: string}) => (
    <svg
      viewBox="0 0 120 100"
      className="absolute bottom-0 right-0 w-28 h-28 opacity-10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 10 L30 80 L50 40 L70 80 L90 10"
        stroke={color}
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const watermarkColors = ["#22c55e", "#f97316", "#3b82f6", "#a855f7"];

  return (
    <div className="relative shrink-0 w-48 rounded-2xl bg-white p-4 flex flex-col gap-3 overflow-hidden">
      {/* <WatermarkW color={watermarkColors[i % watermarkColors.length]} /> */}

      <div className="flex items-center gap-2 z-10">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <Icon icon={exam.icon} width="20" height="20" />
        </div>
        <p className="font-bold text-[#1a2332] text-base">{exam.name}</p>
      </div>

      <div className="flex items-center gap-1 z-10">
        <Icon icon="solar:star-bold" width="13" height="13" color="#f59e0b" />
        <span className="text-xs text-gray-600">
          {exam.rating} ({exam.reviewCount})
        </span>
      </div>

      <div className="flex flex-col gap-0.5 z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1a2332]">
            {exam.currency}
            {exam.price.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 line-through">
            {exam.currency}
            {exam.originalPrice.toLocaleString()}
          </span>
        </div>
        <span className="text-xs text-gray-400">({exam.priceLabel})</span>
      </div>

      <button
        onClick={() => onEnroll?.(exam.id)}
        className="z-10 w-full rounded-xl border border-gray-200 py-2 text-xs font-semibold text-[#1a2332] hover:bg-gray-50 transition-colors cursor-pointer"
      >
        Enroll Now
      </button>
    </div>
  );
}
