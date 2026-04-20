"use client";

import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {banners} from "../constants/Banners";

const Asterisk = ({color}: {color: string}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    {[0, 30, 60, 90, 120, 150].map((angle) => (
      <line
        key={angle}
        x1="100"
        y1="100"
        x2={100 + 85 * Math.cos((angle * Math.PI) / 180)}
        y2={100 + 85 * Math.sin((angle * Math.PI) / 180)}
        stroke={color}
        strokeWidth="22"
        strokeLinecap="round"
      />
    ))}
    {[0, 30, 60, 90, 120, 150].map((angle) => (
      <line
        key={`b-${angle}`}
        x1="100"
        y1="100"
        x2={100 - 85 * Math.cos((angle * Math.PI) / 180)}
        y2={100 - 85 * Math.sin((angle * Math.PI) / 180)}
        stroke={color}
        strokeWidth="22"
        strokeLinecap="round"
      />
    ))}
  </svg>
);

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const variants = {
    enter: (dir: number) => ({x: dir > 0 ? "100%" : "-100%", opacity: 0}),
    center: {x: 0, opacity: 1},
    exit: (dir: number) => ({x: dir > 0 ? "-100%" : "100%", opacity: 0}),
  };

  const next = banners[(current + 1) % banners.length];

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex gap-3 w-full overflow-hidden">
        {/* Main card */}
        <div className="relative flex-1 rounded-2xl overflow-hidden h-36">
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{duration: 0.4, ease: [0.32, 0.72, 0, 1]}}
              className={`absolute inset-0 ${banners[current].bg} p-6 flex items-center justify-between`}
            >
              <div className="flex flex-col gap-4 z-10 max-w-[55%]">
                <p
                  className={`text-sm font-semibold leading-snug ${banners[current].textColor}`}
                >
                  {banners[current].title}
                </p>
                <button
                  className={`flex items-center gap-2 w-fit px-4 py-1.5 rounded-full bg-white text-xs font-semibold text-[#1a2332] shadow-sm`}
                >
                  {banners[current].cta}
                  <span className="w-5 h-5 rounded-full bg-[#1a2332] text-white flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Asterisk decoration */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 translate-x-8 opacity-60">
                <Asterisk color={banners[current].accentColor} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Peek of next card */}
        <div
          className={`w-48 shrink-0 rounded-2xl overflow-hidden h-36 cursor-pointer ${next.bg} p-5 flex flex-col justify-center gap-3 relative`}
          onClick={() => go((current + 1) % banners.length)}
        >
          <p
            className={`text-xs font-semibold leading-snug ${next.textColor} line-clamp-3`}
          >
            {next.title}
          </p>
          <button className="flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#1a2332]">
            {next.cta}
            <span className="w-4 h-4 rounded-full bg-[#1a2332] text-white flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 translate-x-4 opacity-40">
            <Asterisk color={next.accentColor} />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-1.5 pl-1">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 h-1.5 bg-gray-700"
                : "w-1.5 h-1.5 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
