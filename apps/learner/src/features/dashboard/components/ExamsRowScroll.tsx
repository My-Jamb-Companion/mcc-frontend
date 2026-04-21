"use client";

import {useRef} from "react";
import {Icon} from "@mcc/ui";
import ExamCard from "./ExamCard";
import {exams} from "../constants/examsCards";

export default function ExamsRowScroll({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? 220 : -220,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full rounded-2xl bg-[#1a1a1e] p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{subTitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full bg-[#2a2a2e] flex items-center justify-center hover:bg-[#3a3a3e] transition-colors cursor-pointer"
          >
            <Icon
              icon="solar:arrow-left-linear"
              width="16"
              height="16"
              color="white"
            />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full bg-[#2a2a2e] flex items-center justify-center hover:bg-[#3a3a3e] transition-colors cursor-pointer"
          >
            <Icon
              icon="solar:arrow-right-linear"
              width="16"
              height="16"
              color="white"
            />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-1"
        style={{scrollbarWidth: "none"}}
      >
        {exams.map((exam, i) => (
          <ExamCard key={i} exam={exam} />
        ))}
      </div>
    </div>
  );
}
