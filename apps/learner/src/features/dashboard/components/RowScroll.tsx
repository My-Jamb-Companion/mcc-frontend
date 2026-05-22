"use client";
import {useRef} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Icon} from "@mcc/ui";
import React from "react";

interface ScrollRowProps {
  title: string;
  subTitle?: string;
  children: React.ReactNode;
  variant?: "default" | "card";
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  className?: string;
  isLoading?: boolean;
  skeleton?: React.ReactNode;
  skeletonCount?: number;
}

export default function ScrollRow({
  title,
  subTitle,
  children,
  variant = "default",
  showSeeAll = false,
  onSeeAll,
  className = "",
  isLoading = false,
  skeleton,
  skeletonCount = 4,
}: ScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isCard = variant === "card";
  const gap = isCard ? "gap-4" : "gap-6";

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? 300 : -300,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`
        ${isCard ? "w-full rounded-2xl bg-[#1a1a1e] p-6 flex flex-col gap-5" : ""}
        ${className}
      `}
    >
      <div
        className={`flex ${isCard ? "items-start" : "items-center pb-5"} justify-between`}
      >
        <div
          className={`flex ${isCard ? "flex-col gap-1" : "items-center gap-6"}`}
        >
          <p
            className={`font-${isCard ? "bold text-white" : "semibold"} text-xl`}
          >
            {title}
          </p>
          {isCard && subTitle && (
            <p className="text-sm text-gray-400">{subTitle}</p>
          )}
          {!isCard && showSeeAll && (
            <button
              onClick={onSeeAll}
              className="rounded-full p-1 border border-muted/50 cursor-pointer outline-primary"
            >
              <Icon icon="basil:arrow-right-solid" size={20} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isCard ? (
            <>
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-full bg-[#2a2a2e] flex items-center justify-center hover:bg-[#3a3a3e] transition-colors cursor-pointer"
              >
                <Icon icon="solar:arrow-left-linear" size={16} color="white" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-full bg-[#2a2a2e] flex items-center justify-center hover:bg-[#3a3a3e] transition-colors cursor-pointer"
              >
                <Icon icon="solar:arrow-right-linear" size={16} color="white" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => scroll("left")}
                className="rounded-full p-1 border border-muted/50 cursor-pointer outline-primary"
              >
                <Icon icon="basil:caret-left-solid" size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="rounded-full p-1 border border-muted/50 cursor-pointer outline-primary"
              >
                <Icon icon="basil:caret-right-solid" size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{scrollbarWidth: "none"}}
      >
        <AnimatePresence mode="wait">
          {isLoading && skeleton ? (
            <motion.div
              key="skeleton"
              className={`flex ${gap}`}
              exit={{opacity: 0, transition: {duration: 0.15}}}
            >
              {Array.from({length: skeletonCount}).map((_, i) => (
                <div className="w-full" key={i}>
                  {skeleton}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="content" className={`flex ${gap}`}>
              {React.Children.map(children, (child, i) => (
                <motion.div
                  initial={{opacity: 0, scale: 0.95}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  {child}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
