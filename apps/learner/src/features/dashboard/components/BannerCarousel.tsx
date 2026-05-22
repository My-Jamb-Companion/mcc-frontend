"use client";

import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import { banners } from "../constants/Banners";



const BannerCard = ({banner}: {banner: (typeof banners)[0]}) => (
  <div
    className={`${banner.bg} w-full p-6 flex items-center relative h-full max-sm:p-4 max-sm:overflow-hidden rounded-xl`}
  >
    <div className="flex flex-col gap-4 z-10 max-w-[55%] max-sm:max-w-full max-sm:flex-row max-sm:items-center">
      <p
        className={`text-sm font-semibold leading-snug max-sm:text-[11px] ${banner.textColor}`}
      >
        {banner.title}
      </p>
      <button className="flex items-center gap-2 w-fit pl-4 pr-1 py-1.5 rounded-full bg-white text-xs font-semibold text-[#1a2332] shadow-sm text-nowrap">
        {banner.cta}
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

  </div>
);

const PEEK = 80; // px of next card visible
const GAP = 20; // px gap between cards

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const next = banners[(current + 1) % banners.length];

  const activeWidth = `calc(100% - ${PEEK}px - ${GAP}px)`;
  const nextLeft = `calc(100% - ${PEEK}px)`;

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="relative overflow-hidden w-full h-29">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            initial={{x: direction > 0 ? "100%" : "-100%"}}
            animate={{x: 0}}
            exit={{x: direction > 0 ? "-100%" : "100%"}}
            transition={{duration: 0.4, ease: [0.32, 0.72, 0, 1]}}
            className="absolute top-0 left-0 h-full overflow-hidden"
            style={{width: activeWidth}}
          >
            <BannerCard banner={banners[current]} />
          </motion.div>
        </AnimatePresence>

        <div
          className="absolute top-0 h-full rounded-2xl overflow-hidden cursor-pointer"
          style={{left: nextLeft, width: `calc(100% - ${PEEK}px - ${GAP}px)`}}
          onClick={() => go((current + 1) % banners.length)}
        >
          <BannerCard banner={next} />
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