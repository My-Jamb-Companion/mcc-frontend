"use client";

import {useMemo} from "react";
import {Icon} from "@mcc/ui";

export interface FinancialHealthRingStop {
  upTo: number;
  color: string;
}

interface FinancialHealthCardProps {
  title?: string;
  statusLabel: string;
  statusTone?: "success" | "warning" | "danger";
  amount: number;
  currencySymbol?: string;
  changePercent: number;
  changeComparisonLabel?: string;
  footnote?: string;
  ringSegments: FinancialHealthRingStop[];
  ringValueLabel: string;
  ringCaption: string;
  className?: string;
}

const TONE_STYLES: Record<
  NonNullable<FinancialHealthCardProps["statusTone"]>,
  {bg: string; text: string}
> = {
  success: {bg: "#E7F4E4", text: "#2F7A2A"},
  warning: {bg: "#FCF1DD", text: "#9A6A0B"},
  danger: {bg: "#FBE7E7", text: "#B33333"},
};

const GAP_DEGREES = 46;
const SWEEP_DEGREES = 360 - GAP_DEGREES;
const START_ANGLE = 90 + GAP_DEGREES / 2;

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function formatAmount(amount: number) {
  const [whole, decimals] = amount.toFixed(2).split(".");
  return {whole: Number(whole).toLocaleString(), decimals};
}

export function FinancialHealthCard({
  title = "Financial Health",
  statusLabel,
  statusTone = "success",
  amount,
  currencySymbol = "₦",
  changePercent,
  changeComparisonLabel = "from last month",
  footnote = "This condition is based on your last 30-day progress data",
  ringSegments,
  ringValueLabel,
  ringCaption,
  className,
}: FinancialHealthCardProps) {
  const size = 280;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const {whole, decimals} = useMemo(() => formatAmount(amount), [amount]);
  const tone = TONE_STYLES[statusTone];
  const isPositiveChange = changePercent >= 0;

  const knobAngle = ringSegments.length
    ? START_ANGLE + (ringSegments[0].upTo / 100) * SWEEP_DEGREES
    : START_ANGLE;
  const knob = polarPoint(cx, cy, radius, knobAngle);

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-muted/20 w-full max-w-140 p-6 ${className ?? ""}`}
    >
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <div
        className="flex flex-col gap-4 h-fit mt-auto"
        style={{maxWidth: "56%"}}
      >
        <span
          className="w-fit rounded-full px-3 py-1 text-sm font-medium"
          style={{backgroundColor: tone.bg, color: tone.text}}
        >
          {statusLabel}
        </span>

        <div className="leading-none text-neutral-900">
          <span className="text-3xl font-bold tracking-tight sm:text-[32px]">
            {currencySymbol}
            {whole}
          </span>
          <span className="text-lg font-medium text-neutral-400">
            .{decimals}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm">
          <Icon
            icon={
              isPositiveChange
                ? "mdi:chevron-double-up"
                : "mdi:chevron-double-down"
            }
            size={14}
            className={isPositiveChange ? "text-green-600" : "text-red-500"}
          />
          <span
            className={`font-semibold ${isPositiveChange ? "text-green-600" : "text-red-500"}`}
          >
            {Math.abs(changePercent)}%
          </span>
          <span className="text-neutral-500">{changeComparisonLabel}</span>
        </div>

        <p className="mt-auto max-w-55 text-sm text-neutral-400 pt-30">
          {footnote}
        </p>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 right-0 translate-x-[18%] translate-y-[18%]"
        style={{width: size, height: size}}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#F4F2EC"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${(SWEEP_DEGREES / 360) * circumference} ${circumference}`}
            transform={`rotate(${START_ANGLE} ${cx} ${cy})`}
          />

          {ringSegments.map((segment, index) => {
            const prevUpTo = ringSegments[index - 1]?.upTo ?? 0;
            const segmentLength =
              ((segment.upTo - prevUpTo) / 100) * SWEEP_DEGREES;
            const segmentOffset = (prevUpTo / 100) * SWEEP_DEGREES;
            const arcLength = (segmentLength / 360) * circumference;
            const rotation = START_ANGLE + segmentOffset;

            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${arcLength} ${circumference}`}
                transform={`rotate(${rotation} ${cx} ${cy})`}
              />
            );
          })}

          {ringSegments.length > 0 && (
            <circle
              cx={knob.x}
              cy={knob.y}
              r={strokeWidth * 0.7}
              fill={ringSegments[0].color}
              stroke="white"
              strokeWidth={3}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-neutral-900">
            {ringValueLabel}
          </span>
          <span className="mt-1 max-w-[120px] text-sm leading-tight text-neutral-500">
            {ringCaption}
          </span>
        </div>
      </div>
    </div>
  );
}

export default FinancialHealthCard;
