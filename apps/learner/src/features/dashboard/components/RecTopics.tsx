"use client";

import {useRef} from "react";
import {Icon} from "@mcc/ui";
import type {ApiTopic} from "@/src/features/explore/services/topics.service";

interface TopicsRowProps {
  title?: string;
  /** The categories to offer: the admin's active ones that have published courses. */
  topics: ApiTopic[];
  /** The category now filtering the course list, to mark it. */
  selectedId?: string;
  onSelect: (topic: ApiTopic) => void;
}

/**
 * Topics to browse by. They are the categories set up in the admin console, so a topic exists only while it is
 * switched on and has a course to show; picking one filters the course list below.
 */
export default function RecTopics({title = "Browse by topic", topics, selectedId, onSelect}: TopicsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (topics.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({left: dir === "right" ? 300 : -300, behavior: "smooth"});
  };

  const row1 = topics.slice(0, Math.ceil(topics.length / 2));
  const row2 = topics.slice(Math.ceil(topics.length / 2));

  const TopicButton = ({topic}: {topic: ApiTopic}) => {
    const selected = topic.category_id === selectedId;
    return (
      <button
        type="button"
        onClick={() => onSelect(topic)}
        aria-pressed={selected}
        className={`flex w-full items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition-colors cursor-pointer ${
          selected ? "border-primary bg-primary/10 text-primary" : "border-muted/40 hover:bg-muted/10"
        }`}
      >
        <Icon icon="ri:instance-fill" size={16} />
        {topic.name}
        <span className="ml-auto pl-2 text-xs font-normal text-subtle">{topic.course_count}</span>
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-lg">{title}</p>

        {topics.length > 6 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              aria-label="Scroll topics left"
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full border border-muted/20 flex items-center justify-center hover:bg-muted/10 transition-colors cursor-pointer"
            >
              <Icon icon="basil:caret-left-solid" size={16} />
            </button>
            <button
              type="button"
              aria-label="Scroll topics right"
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full border border-muted/20 flex items-center justify-center hover:bg-muted/10 transition-colors cursor-pointer"
            >
              <Icon icon="basil:caret-right-solid" size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {topics.map((topic) => (
          <TopicButton key={topic.category_id} topic={topic} />
        ))}
      </div>

      <div className="hidden sm:block overflow-hidden">
        <div ref={scrollRef} className="flex flex-col gap-3 overflow-x-auto scrollbar-hide" style={{scrollbarWidth: "none"}}>
          <div className="flex gap-3">
            {row1.map((topic) => (
              <TopicButton key={topic.category_id} topic={topic} />
            ))}
          </div>
          {row2.length > 0 && (
            <div className="flex gap-3">
              {row2.map((topic) => (
                <TopicButton key={topic.category_id} topic={topic} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
