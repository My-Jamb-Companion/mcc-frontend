"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";

interface AskAICardProps {
  onSubmit?: (query: string) => void;
  onSurprise?: () => void;
  onMic?: () => void;
}

export default function AskAICard({
  onSubmit,
  onSurprise,
  onMic,
}: AskAICardProps) {
  const [query, setQuery] = useState("");

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) onSubmit?.(query.trim());
  };

  return (
    <div className="w-full rounded-xl bg-[#F0F0F8] p-8 max-sm:p-5 max-sm:gap-8 flex flex-col gap-25 overflow-hidden">
      <div className="flex flex-col gap-5">
        <button
          onClick={onSurprise}
          className="flex items-center gap-1.5 w-fit cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Icon icon="solar:stars-bold" size={18} color="#7C3AED" />
          <span className="text-sm font-medium text-[#1a2332]">
            Surprise me!
          </span>
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-medium leading-snug max-w-[75%] max-sm:text-lg">
            Hey, not sure about what you want to learn?
          </h2>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Just ask me anything about it"
            className=" min-w-0 bg-transparent text-3xl text-hint max-sm:text-xl placeholder:text-hint outline-none caret-muted"
          />
        </div>
      </div>

      <button
        onClick={query ? () => onSubmit : onMic}
        className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
      >
        <Icon
          icon={query ? "iconamoon:send-light" : "solar:microphone-outline"}
          size={22}
          color="#1a2332"
        />
      </button>
    </div>
  );
}
