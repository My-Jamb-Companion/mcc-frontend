"use client";

import { useRef } from "react";
import { Icon } from "@mcc/ui";

interface TopicsRowProps {
  title?: string;
  topics?: string[];
  onSelect?: (topic: string) => void;
}

const defaultTopics = [
  "Finance",
  "Business Strategy",
  "Mobile App design",
  "Entrepreneurship",
  "Youtube",
  "Social sciences",
  "Management skills",
  "Health management",
  "Design",
  "Communication",
  "Finance",
  "Arts and Humanities",
  "Technology",
  "Marketing",
];

export default function TopicsRow({
  title = "Topics recommended for you",
  topics = defaultTopics,
  onSelect,
}: TopicsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? 300 : -300,
      behavior: "smooth",
    });
  };

  const row1 = topics.slice(0, Math.ceil(topics.length / 2));
  const row2 = topics.slice(Math.ceil(topics.length / 2));

  const TopicButton = ({ topic }: { topic: string }) => (
    <button
      onClick={() => onSelect?.(topic)}
      className="flex items-center gap-2 border border-muted/40 shadow-sm rounded-xl px-4 py-3 text-sm font-medium  hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap w-full"
    >
      <Icon icon="ri:instance-fill" width="16" height="16"/>
      {topic}
    </button>
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-lg">{title}</p>
        {/* Arrows — desktop only */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Icon icon="basil:caret-left-solid" width="16" height="16" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Icon icon="basil:caret-right-solid" width="16" height="16" />
          </button>
        </div>
      </div>

      {/* Mobile — 2 column grid */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {topics.map((topic) => (
          <TopicButton key={topic} topic={topic} />
        ))}
      </div>

      {/* Desktop — horizontal scroll rows */}
      <div className="hidden sm:block overflow-hidden">
        <div
          ref={scrollRef}
          className="flex flex-col gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex gap-3">
            {row1.map((topic) => (
              <TopicButton key={topic} topic={topic} />
            ))}
          </div>
          <div className="flex gap-3">
            {row2.map((topic) => (
              <TopicButton key={topic + topic} topic={topic} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}