"use client";

import {useRef} from "react";
import {Icon} from "@mcc/ui";

interface CourseScrollRowProps {
  title: string;
  children: React.ReactNode;
}

export default function CourseScrollRow({
  title,
  children,
}: CourseScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? 320 : -320,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-5">
        <div className="flex items-center gap-6">
          <p className="font-semibold text-xl">{title}</p>
          <button className="rounded-full p-1 border border-muted/50 cursor-pointer">
            <Icon icon="basil:arrow-right-solid" width="20" height="20" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="rounded-full p-1 border border-muted/50 cursor-pointer bg-hint/50 text-muted"
          >
            <Icon icon="basil:caret-left-solid" width="20" height="20" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full p-1 border border-muted/50 cursor-pointer"
          >
            <Icon icon="basil:caret-right-solid" width="20" height="20" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto"
          style={{scrollbarWidth: "none"}}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
