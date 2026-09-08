"use client";

import {useEffect, useMemo, useState} from "react";
import {Icon} from "@mcc/ui";

export interface ProgramPerformanceDatum {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  color?: string;
  iconUrl?: string;
}

interface PerformanceByProgramsChartProps {
  data: ProgramPerformanceDatum[];
  title?: string;
  rangeLabel?: string;
  currencySymbol?: string;
  isLoading?: boolean;
  className?: string;
}

const MAX_CARD_HEIGHT = "clamp(200px, 32vw, 320px)";
const SOLID_BLOCK_HEIGHT = "clamp(72px, 9vw, 96px)";
const MIN_HEIGHT_PERCENT = 18;

const DEFAULT_PALETTE = [
  "#4F3FE0",
  "#F2790C",
  "#1C6B4B",
  "#E0A812",
  "#7CC42E",
  "#D2416B",
  "#2E7DD1",
  "#8A4FE0",
];

function formatCurrency(value: number, currencySymbol: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  });
  return `${currencySymbol}${formatter.format(value)}`;
}

export function PerformanceByProgramsChart({
  data,
  title = "Performance by Programs",
  rangeLabel = "Top 5",
  currencySymbol = "₦",
  isLoading = false,
  className = "",
}: PerformanceByProgramsChartProps) {
  const [mounted, setMounted] = useState(false);

  const animationKey = useMemo(
    () => data.map((d) => `${d.id}:${d.value}`).join("|"),
    [data],
  );

  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      setMounted(false);
      requestAnimationFrame(() => {
        if (cancelled) return;
        setMounted(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [animationKey]);

  const items = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    return data.map((item, index) => ({
      ...item,
      color: item.color ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length],
      displayValue: formatCurrency(item.value, currencySymbol),
      heightPercent: Math.max(
        (item.value / maxValue) * 100,
        MIN_HEIGHT_PERCENT,
      ),
    }));
  }, [data, currencySymbol]);

  return (
    <div
      className={`w-full min-w-0 rounded-2xl border border-neutral-100 bg-white p-4 sm:p-6 ${className}`}
    >
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <h3 className="text-base font-semibold text-neutral-900 sm:text-lg truncate">
          {title}
        </h3>
        <button
          type="button"
          aria-label={`Select range filter: ${rangeLabel}`}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
        >
          {rangeLabel}
          <Icon icon="mdi:unfold-more-horizontal" size={16} />
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0 min-w-0">
          <div className="flex items-end gap-3 sm:gap-4 w-full min-w-0">
            {items.map((item, index) => {
              const targetCardHeight = `calc(${MAX_CARD_HEIGHT} * ${item.heightPercent} / 100)`;
              const delayMs = index * 70;

              return (
                <div
                  key={item.id}
                  className="flex w-24 shrink-0 flex-col sm:w-auto sm:flex-1 sm:shrink min-w-0"
                >
                  <div
                    className="relative flex flex-col justify-end overflow-hidden rounded-2xl transition-[height] duration-700 ease-out"
                    style={{
                      height: mounted ? targetCardHeight : SOLID_BLOCK_HEIGHT,
                      transitionDelay: `${delayMs}ms`,
                    }}
                  >
                    <div
                      className={`mx-3 mt-3 h-1 origin-left rounded-full transition-transform duration-500 ease-out sm:mx-4 sm:mt-4 ${
                        mounted ? "scale-x-100" : "scale-x-0"
                      }`}
                      style={{
                        backgroundColor: item.color,
                        transitionDelay: `${delayMs + 400}ms`,
                      }}
                    />

                    <div
                      className={`min-h-0 flex-1 transition-opacity duration-500 ease-out ${
                        mounted ? "opacity-100" : "opacity-0"
                      }`}
                      style={{
                        backgroundColor: `${item.color}1A`,
                        backgroundImage: `repeating-linear-gradient(135deg, ${item.color}33 0, ${item.color}33 2px, transparent 2px, transparent 10px)`,
                        transitionDelay: `${delayMs + 300}ms`,
                      }}
                    />

                    <div
                      className={`flex shrink-0 flex-col justify-center gap-1 px-2 sm:px-4 py-2 transition-all duration-500 ease-out hover:brightness-110 ${
                        mounted ? "translate-y-0" : "translate-y-2"
                      }`}
                      style={{
                        height: SOLID_BLOCK_HEIGHT,
                        backgroundColor: item.color,
                        transitionDelay: `${delayMs}ms`,
                      }}
                    >
                      <span className="text-[11px] text-white/80 sm:text-xs">
                        Total
                      </span>
                      <span className="truncate text-xs font-semibold text-white sm:text-lg">
                        {item.displayValue}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-3 flex items-center gap-2 transition-opacity duration-500 ease-out min-w-0 ${
                      mounted ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${delayMs + 500}ms`,
                    }}
                  >
                    {item.iconUrl ? (
                      <img
                        src={item.iconUrl}
                        alt={item.label}
                        className="h-7 w-7 shrink-0 rounded-lg object-cover sm:h-8 sm:w-8"
                      />
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 sm:h-8 sm:w-8">
                        <Icon
                          icon="mdi:certificate-outline"
                          size={16}
                          className="text-neutral-500"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 text-xs leading-tight text-neutral-700 sm:text-sm">
                      <p className="truncate text-neutral-500">
                        {item.sublabel}
                      </p>
                      <p className="truncate font-medium">{item.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex items-end gap-3 sm:gap-4 min-w-0">
      {Array.from({length: 5}).map((_, index) => (
        <div
          key={index}
          className="flex w-24 shrink-0 flex-col sm:w-auto sm:flex-1 sm:shrink min-w-0"
        >
          <div
            className="animate-pulse rounded-2xl bg-neutral-100"
            style={{
              height: `calc(${MAX_CARD_HEIGHT} * ${100 - index * 12} / 100)`,
            }}
          />
          <div className="mt-3 flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-neutral-100 sm:h-8 sm:w-8" />
            <div className="flex-1 space-y-1 min-w-0">
              <div className="h-2.5 w-12 animate-pulse rounded bg-neutral-100" />
              <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Icon
        icon="mdi:chart-bar-stacked"
        size={28}
        className="text-neutral-300"
      />
      <p className="text-sm font-medium text-neutral-400">
        No program data to show yet
      </p>
    </div>
  );
}

export default PerformanceByProgramsChart;
